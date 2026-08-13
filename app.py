import json
import asyncio
import os
import sys
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(filename='debug.log', level=logging.DEBUG, 
                    format='%(asctime)s %(levelname)s %(name)s %(message)s')
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse

from core.scraper import scrape_job_description
from core.loop import run_resume_loop
from core.extractor import extract_text_from_file
from core.agents import StudyAgent, InterviewerAgent
from pydantic import BaseModel

class ExplainRequest(BaseModel):
    api_key: str
    tavily_key: str
    skill: str
    jd: str

class ScoreRequest(BaseModel):
    api_key: str
    jd: str
    resume: str
    transcript: str

app = FastAPI()

# Stream logs to clients
log_queue = asyncio.Queue()

class LogOutput:
    def write(self, message):
        sys.__stdout__.write(message)
        if message.strip():
            asyncio.create_task(log_queue.put(message))
    def flush(self):
        sys.__stdout__.flush()

sys.stdout = LogOutput()

# Ensure static directory exists
os.makedirs("static", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            log_msg = await log_queue.get()
            await websocket.send_text(log_msg)
    except WebSocketDisconnect:
        pass

@app.get("/")
async def get_index():
    return FileResponse("static/landing.html")

@app.get("/app")
async def get_app():
    return FileResponse("static/index.html")

@app.post("/extract-file")
async def extract_file(file: UploadFile = File(...)):
    contents = await file.read()
    text = await asyncio.to_thread(extract_text_from_file, file.filename, contents)
    if text.startswith("Error") or text.startswith("Unsupported"):
        raise HTTPException(status_code=400, detail=text)
    return {"text": text}

@app.post("/explain-skill")
async def explain_skill(req: ExplainRequest):
    try:
        api_key = req.api_key if req.api_key else os.getenv("GEMINI_API_KEY")
        tavily_key = req.tavily_key if req.tavily_key else os.getenv("TAVILY_API_KEY")
        agent = StudyAgent(api_key=api_key)
        explanation = await agent.explain(req.skill, req.jd, tavily_key)
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Wait for initial configuration from client
        data = await websocket.receive_text()
        request_data = json.loads(data)
        
        base_resume = request_data.get("base_resume")
        jd_url = request_data.get("jd_url")
        jd_text = request_data.get("jd_text")
        api_key = request_data.get("api_key")
        
        if not api_key:
            api_key = os.getenv("GEMINI_API_KEY")
            
        if not api_key:
            await websocket.send_json({"type": "log", "message": "Error: Missing API Key."})
            await websocket.close()
            return
            
        if not base_resume:
            await websocket.send_json({"type": "log", "message": "Error: Missing Base Resume."})
            await websocket.close()
            return
            
        if not jd_url and not jd_text:
            await websocket.send_json({"type": "log", "message": "Error: Missing Job Description."})
            await websocket.close()
            return

        final_jd_text = ""
        if jd_text:
            await websocket.send_json({"type": "log", "message": "Using provided Job Description text..."})
            final_jd_text = jd_text
        else:
            await websocket.send_json({"type": "log", "message": f"Fetching Job Description from {jd_url}..."})
            scraped_text = await asyncio.to_thread(scrape_job_description, jd_url)
            
            if scraped_text.startswith("Error"):
                await websocket.send_json({"type": "log", "message": scraped_text})
                await websocket.close()
                return
            final_jd_text = scraped_text
            await websocket.send_json({"type": "log", "message": "Successfully extracted Job Description."})
        
        await websocket.send_json({"type": "log", "message": "Starting agent loop..."})
        
        # Run the agent loop
        await run_resume_loop(base_resume, final_jd_text, api_key, send_update=websocket.send_json)
            
        await websocket.close()
        
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        try:
            await websocket.send_json({"type": "log", "message": f"Fatal error: {str(e)}"})
            await websocket.close()
        except:
            pass

@app.post("/api/score")
async def score_interview(req: ScoreRequest):
    try:
        from google import genai
        api_key = req.api_key if req.api_key else os.getenv("GEMINI_API_KEY")
        client = genai.Client(api_key=api_key)
        
        prompt = f"""You are a Senior Technical Recruiter. Evaluate the following interview transcript against the provided Job Description and the candidate's Resume.
        
        Job Description:
        {req.jd}
        
        Resume:
        {req.resume}
        
        Transcript:
        {req.transcript}
        
        Provide your evaluation in valid JSON format with the following keys:
        - "score": An integer from 0 to 100 representing the overall interview performance.
        - "strengths": An array of 2-3 strings highlighting what the candidate did well.
        - "weaknesses": An array of 2-3 strings highlighting areas for improvement.
        - "feedback": A brief paragraph with final recommendations.
        
        DO NOT include any markdown formatting or code blocks around the JSON output. Just output the raw JSON string."""
        
        response = client.models.generate_content(
            model='gemini-3.5-flash-lite',
            contents=prompt,
        )
        
        try:
            parsed = json.loads(response.text)
            return parsed
        except json.JSONDecodeError:
            # Try to strip markdown if the model hallucinates it
            text = response.text.replace('```json', '').replace('```', '').strip()
            parsed = json.loads(text)
            return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/interview")
async def interview_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        # Initial config
        data = await websocket.receive_text()
        config = json.loads(data)
        api_key = config.get("api_key")
        
        if not api_key:
            api_key = os.getenv("GEMINI_API_KEY")
            
        base_resume = config.get("base_resume")
        jd = config.get("jd")
        voice_name = config.get("voice", "Aoede")
        
        if not api_key:
            await websocket.close()
            return
            
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=api_key)
        model = "gemini-3.1-flash-live-preview"
        
        sys_instruct = f"""You are an expert Technical Hiring Manager conducting a mock audio interview.
Speak concisely in a human-like voice. Do not use markdown. Ask one question at a time. Evaluate the candidate's answer briefly before asking the next question.

You must ask exactly 10 questions in total. Keep track of the number of questions you have asked. 
After the candidate answers the 10th question, thank them for their time, state clearly that the interview is now concluded, and instruct them to click the 'End Interview' button on their screen to receive their scorecard. 
DO NOT ask any more questions after the 10th question.

CRITICAL: If the candidate says they want to quit, stop, or end the interview early at any point, immediately thank them for their time, conclude the interview, and instruct them to click the 'End Interview' button.

Job Description:
{jd}

Candidate's Resume:
{base_resume}

Begin the interview by greeting the candidate and asking the first question immediately."""

        live_config = {
            "response_modalities": ["AUDIO"],
            "system_instruction": {"parts": [{"text": sys_instruct}]},
            "speech_config": {
                "voice_config": {
                    "prebuilt_voice_config": {
                        "voice_name": voice_name
                    }
                }
            }
        }

        async with client.aio.live.connect(model=model, config=live_config) as session:
            print("Connected to Gemini Live. Triggering initial greeting...")
            
            # Send initial message to trigger the AI to speak first
            await session.send(input="Hello! I am ready to begin the interview.", end_of_turn=True)
            
            async def receive_from_browser():
                try:
                    while True:
                        msg = await websocket.receive()
                        if msg.get("type") == "websocket.disconnect":
                            break
                        if "bytes" in msg:
                            # Send raw PCM audio to Gemini
                            try:
                                await session.send_realtime_input(
                                    audio=types.Blob(
                                        data=msg["bytes"],
                                        mime_type="audio/pcm;rate=16000"
                                    )
                                )
                            except Exception as e:
                                logging.error(f"Error sending audio: {e}")
                        if "text" in msg:
                            try:
                                txt_data = json.loads(msg["text"])
                                if txt_data.get("command") == "force_reply":
                                    logging.info("Forcing AI reply...")
                                    await session.send(end_of_turn=True)
                                elif txt_data.get("command") == "user_speech":
                                    user_text = txt_data.get("text")
                                    logging.info(f"User said: {user_text}")
                                    await session.send(input=user_text, end_of_turn=True)
                            except Exception as e:
                                logging.error(f"Text parsing error: {e}")
                except asyncio.CancelledError:
                    logging.info("receive_from_browser cancelled.")
                except Exception as e:
                    logging.error(f"Browser receive error: {e}")

            async def receive_from_gemini():
                try:
                    while True:
                        async for response in session.receive():
                            server_content = response.server_content
                            if server_content is not None:
                                model_turn = server_content.model_turn
                                if model_turn:
                                    for part in model_turn.parts:
                                        if part.inline_data and part.inline_data.data:
                                            await websocket.send_bytes(part.inline_data.data)
                                
                                if server_content.input_transcription:
                                    await websocket.send_json({
                                        "role": "candidate",
                                        "transcript": server_content.input_transcription.text
                                    })
                                if server_content.output_transcription:
                                    await websocket.send_json({
                                        "role": "interviewer",
                                        "transcript": server_content.output_transcription.text
                                    })
                except asyncio.CancelledError:
                    logging.info("receive_from_gemini cancelled.")
                except Exception as e:
                    logging.error(f"Gemini receive error: {e}")

            task1 = asyncio.create_task(receive_from_browser())
            task2 = asyncio.create_task(receive_from_gemini())
            
            done, pending = await asyncio.wait(
                [task1, task2],
                return_when=asyncio.FIRST_COMPLETED
            )
            for t in done:
                logging.info(f"Task completed: {t}")
            for t in pending:
                t.cancel()

    except WebSocketDisconnect:
        logging.info("Interview Client disconnected")
    except Exception as e:
        logging.error(f"Fatal websocket error: {e}")
        try:
            await websocket.send_json({"error": str(e)})
            await websocket.close()
        except:
            pass
