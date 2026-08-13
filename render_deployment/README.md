# Render (PaaS) Deployment Guide

This folder contains configurations specifically optimized for deploying this application to **Render**, keeping your root directory strictly optimized for AWS.

## How to Deploy to Render

### Option 1: Using the Render Dashboard (Manual Docker Setup)
1. Log into your Render account and create a new **Web Service**.
2. Connect your GitHub repository.
3. In the setup screen, configure the following:
   - **Root Directory:** leave blank or set to `.`
   - **Environment:** `Docker`
   - **Dockerfile Path:** `./render_deployment/Dockerfile`
4. Under **Environment Variables**, add the following keys (values are your actual API keys):
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
   - `TAVILY_API_KEY`
5. Click **Create Web Service**.

### Option 2: Using the Blueprint (Infrastructure as Code)
Render supports Infrastructure as Code via the `render.yaml` file.
1. In the Render Dashboard, go to **Blueprints**.
2. Connect your repository.
3. Render will automatically detect the `./render_deployment/render.yaml` file if you specify the path, or you can copy the `render.yaml` from this folder to the root of your repository for the 1-click deploy to work.

### Important Notes for Render
- **Dynamic Port:** The `Dockerfile` in this folder uses a dynamic `${PORT}` variable because Render assigns ports dynamically (unlike AWS which binds to a static port 80).
- **Timeouts:** Render's Free Tier spins down inactive instances after 15 minutes. Additionally, it drops WebSocket connections after 5 minutes of absolute silence. As long as you are speaking during the Mock Interview, the audio stream will keep the connection alive.
