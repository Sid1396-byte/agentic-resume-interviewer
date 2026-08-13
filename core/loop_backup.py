import asyncio
import re
import json
from typing import AsyncGenerator, Dict, Any
from core.agents import MatcherAgent, CriticAgent, PreScreenAgent, GapAnalystAgent, InputGuardrailAgent, OutputGuardrailAgent

async def run_resume_loop(base_resume: str, jd: str, api_key: str, max_iterations: int = 3) -> AsyncGenerator[Dict[str, Any], None]:
    try:
        matcher = MatcherAgent(api_key=api_key)
        critic = CriticAgent(api_key=api_key)
        prescreen = PreScreenAgent(api_key=api_key)
        gap_analyst = GapAnalystAgent(api_key=api_key)
        input_guardrail = InputGuardrailAgent(api_key=api_key)
        output_guardrail = OutputGuardrailAgent(api_key=api_key)
        
        if send_update: await send_update({"type": "log", "message": "Starting Resume Tailor loop..."})
        
        if send_update: await send_update({"type": "log", "message": "Running Input Guardrail to verify content safety..."})
        guardrail_in = await asyncio.to_thread(input_guardrail.evaluate, base_resume, jd)
        if not guardrail_in.get("is_safe", True):
            if send_update: await send_update({"type": "log", "message": f"\n[CRITICAL ERROR] INPUT BLOCKED BY GUARDRAIL: {guardrail_in.get('reason')})"}
            if send_update: await send_update({"type": "final", "content": "# Generation Blocked\n\nThe AI system rejected this input for safety reasons:\n**" + guardrail_in.get('reason', 'Unknown reason') + "**"})
            return
        
        if send_update: await send_update({"type": "log", "message": "Running Pre-Screen Agent to check for massive reality gaps..."})
        prescreen_result = await asyncio.to_thread(prescreen.evaluate, base_resume, jd)
        prescreen_context = ""
        
        if prescreen_result.get("is_low_match"):
            if send_update: await send_update({"type": "log", "message": f"\n[LOW MATCH WARNING] {prescreen_result.get('warning_message')})"}
            prescreen_context = prescreen_result.get("critic_context_flag")
            
        if send_update: await send_update({"type": "log", "message": "Running Gap Analysis..."})
        gap_result = await asyncio.to_thread(gap_analyst.evaluate, base_resume, jd)
        if send_update: await send_update({"type": "gap_analysis", "content": gap_result})
        
        current_draft = ""
        critic_feedback = None
        feedback_history = []
        
        for i in range(1, max_iterations + 1):
            if critic_feedback:
                feedback_history.append(f"--- Iteration {i-1} Feedback ---\n{critic_feedback}")
            combined_feedback = "\n\n".join(feedback_history) if feedback_history else None
            
            if send_update: await send_update({"type": "log", "message": f"\n--- Iteration {i}) ---"}
            
            # Matcher Step
            if send_update: await send_update({"type": "log", "message": "Matcher Agent is drafting the resume..."})
            # Simulate async for the LLM call to not block the event loop (though the API call in agents.py is sync)
            # In a real async app we'd use AsyncGroq, but for now we run sync code in threadpool
            current_draft_raw = await asyncio.to_thread(matcher.draft, base_resume, jd, combined_feedback, current_draft if current_draft else None)
            
            # Parse scratchpad
            scratchpad_match = re.search(r'<scratchpad>(.*?)</scratchpad>', current_draft_raw, re.DOTALL)
            if scratchpad_match:
                scratchpad_content = scratchpad_match.group(1).strip()
                if send_update: await send_update({"type": "log", "message": f"Matcher Scratchpad Plan:\n{scratchpad_content})"}
                current_draft = re.sub(r'<scratchpad>.*?</scratchpad>', '', current_draft_raw, flags=re.DOTALL).strip()
            else:
                current_draft = current_draft_raw.strip()
                
            if send_update: await send_update({"type": "log", "message": "Matcher Agent finished drafting."})
            if send_update: await send_update({"type": "draft", "content": current_draft})
            
            # Critic Step
            if send_update: await send_update({"type": "log", "message": "Critic Agent is evaluating the draft..."})
            eval_result = await asyncio.to_thread(critic.evaluate, current_draft, base_resume, jd, combined_feedback, prescreen_context)
            score = eval_result.get("score", 0)
            critic_feedback = eval_result.get("feedback", "")
            
            if send_update: await send_update({"type": "log", "message": f"Critic Score: {score})/100"}
            if send_update: await send_update({"type": "log", "message": f"Critic Feedback:\n{critic_feedback})"}
            
            try:
                feedback_json = json.loads(critic_feedback)
                
                sacred_sections = ["Experience", "Professional Summary", "Skills", "Education", "Projects"]
                if "mandatory_deletions" in feedback_json:
                    filtered_deletions = []
                    for d in feedback_json["mandatory_deletions"]:
                        is_sacred_deletion = False
                        for sacred in sacred_sections:
                            # Only protect if the deletion target is the ENTIRE section itself (e.g. "Skills" or "Skills section")
                            if d.lower().strip() in [sacred.lower(), f"{sacred.lower()} section"]:
                                is_sacred_deletion = True
                                break
                        
                        if not is_sacred_deletion:
                            filtered_deletions.append(d)
                        else:
                            # If we strip it, let's inject a soft revert instruction instead
                            if "mandatory_additions" not in feedback_json:
                                feedback_json["mandatory_additions"] = []
                            feedback_json["mandatory_additions"].append(f"REVERT the {d} section to its factual state rather than deleting it. Do not invent qualifications.")
                    
                    feedback_json["mandatory_deletions"] = filtered_deletions
                    critic_feedback = json.dumps(feedback_json, indent=2)
                
                has_mandatory_changes = bool(feedback_json.get("mandatory_deletions") or feedback_json.get("mandatory_additions"))
            except Exception:
                has_mandatory_changes = True

            if score >= 80 and not has_mandatory_changes:
                if send_update: await send_update({"type": "log", "message": "\nSuccess! Score is 80 or above with zero mandatory changes. Terminating loop."})
                break
            elif not has_mandatory_changes:
                if score < 80:
                    if send_update: await send_update({"type": "log", "message": "\nLoop terminated. Critic determined it is ethically impossible to raise the score further without hallucinating, and the draft contains no fluff to delete."})
                else:
                    if send_update: await send_update({"type": "log", "message": "\nSuccess! Critic requires no mandatory changes. Terminating loop."})
                break
            else:
                if score >= 80:
                    if send_update: await send_update({"type": "log", "message": "\nScore is 80 or above, but mandatory changes are still required. Forcing another revision..."})
                else:
                    if send_update: await send_update({"type": "log", "message": "\nScore is below 80 and changes are required. Sending back to Matcher for revisions..."})
                
        if send_update: await send_update({"type": "log", "message": "Workflow completed. Running Output Guardrail..."})
        guardrail_out = await asyncio.to_thread(output_guardrail.evaluate, current_draft, base_resume)
        
        if not guardrail_out.get("is_safe", True):
            if send_update: await send_update({"type": "log", "message": f"\n[CRITICAL ERROR] OUTPUT BLOCKED BY GUARDRAIL: {guardrail_out.get('reason')})"}
            if send_update: await send_update({"type": "final", "content": "# Generation Blocked\n\nThe AI system rejected the generated output for safety reasons:\n**" + guardrail_out.get('reason', 'Unknown reason') + "**"})
            return
            
        if send_update: await send_update({"type": "log", "message": "Output is safe."})
        if send_update: await send_update({"type": "final", "content": current_draft})
        
    except Exception as e:
        if send_update: await send_update({"type": "log", "message": f"An error occurred: {str(e)})"}
