# ResuMatch: Autonomous Career Engineering Engine

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-teal)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20ECR-orange)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-green)

An enterprise-grade, multi-agent AI application designed to autonomously tailor resumes to specific job descriptions with a strict **Zero-Hallucination Policy**, alongside a real-time AI mock interview simulation platform.

---

## 🏗️ System Architecture

The application is built on a modern, lightweight, and highly concurrent stack:
- **Backend:** Python (FastAPI) for high-performance async routing and WebSocket management.
- **Frontend:** Vanilla JavaScript and TailwindCSS for a highly responsive, zero-dependency SPA (Single Page Application).
- **AI/LLM Layer:** Deep integration with Google Gemini 1.5 Flash (via official SDK) and Groq LLaMA models (via REST/requests) for ultra-fast inference.
- **Orchestration:** Multi-agent loop utilizing explicit `Scratchpad` reasoning and independent `Critic` oversight.
- **Infrastructure:** Dockerized with a security-first approach (non-root `appuser`) and orchestrated via `docker-compose`.
- **CI/CD:** Fully automated GitHub Actions pipeline deploying to AWS (Elastic Container Registry -> EC2).

---

## 🧠 Multi-Agent Workflow (The "Agentic Loop")

Unlike standard "wrapper" AI applications, ResuMatch uses an adversarial, multi-agent architecture to ensure factual accuracy and high ATS scores without fabricating experience.

1. **Pre-Screen Agent (The Guardrail):** Instantly analyzes the base resume against the JD to calculate mathematical impossibilities (e.g., 1 year of experience vs. a strict 10-year requirement). If a massive reality gap exists, it alerts the user and short-circuits the process.
2. **Matcher Agent (The Drafter):** Re-writes resume bullet points to align perfectly with JD keywords, utilizing an internal `<scratchpad>` to plan its semantic mapping before outputting the final text.
3. **Critic Agent (The Enforcer):** An independent LLM that mathematically scores the Matcher's draft out of 100. It strictly enforces the **Zero-Hallucination Policy**. If it detects AI "fluff" or fabricated skills, it scores the draft `0/100`, issues a `mandatory_deletions` array, and forces the Matcher to re-draft.
4. **Iteration Limit:** The loop runs for a maximum of 3 iterations. If the Critic determines that it is ethically impossible to raise the score without hallucinating, it gracefully terminates the loop early to save compute resources.

---

## 🚀 Local Development Setup

To run this application on your local machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sid1396-byte/agentic-resume-interviewer.git
   cd agentic-resume-interviewer
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   TAVILY_API_KEY=your_tavily_key_here
   GROQ_API_KEY=your_groq_key_here
   ```

5. **Run the server:**
   ```bash
   uvicorn app:app --reload --port 8080
   ```
   *Navigate to `http://localhost:8080` in your browser.*

---

## ☁️ AWS Production Deployment Guide

This repository includes a fully automated CI/CD pipeline (`.github/workflows/deploy.yml`) that pushes your code to an AWS EC2 instance anytime you commit to the `main` branch. 

To recreate the production environment from scratch, follow these exact steps:

### Phase 1: AWS Infrastructure Setup
1. **Create the ECR Registry:**
   - Go to AWS Elastic Container Registry (ECR).
   - Create a Private repository named exactly: `resume-tailor`.
2. **Launch the EC2 Web Server:**
   - Launch an **Ubuntu** EC2 instance (t2.micro or t3.micro is sufficient).
   - Allocate **15GB - 20GB** of EBS storage.
   - Under Network Settings, ensure **Allow SSH (22)** and **Allow HTTP (80)** are checked.
   - Create and download a new Key Pair `.pem` file.

### Phase 2: IAM Security Configuration
1. Go to AWS IAM -> **Users** -> Create a new user (e.g., `github-actions-bot`).
2. Attach the policy: `AmazonEC2ContainerRegistryPowerUser` directly to the user.
3. Generate an **Access Key ID** and **Secret Access Key** for this user.

### Phase 3: GitHub CI/CD Configuration
In your GitHub repository, navigate to **Settings -> Secrets and variables -> Actions** and add the following repository secrets:

- `AWS_ACCESS_KEY_ID` *(From IAM Phase 2)*
- `AWS_SECRET_ACCESS_KEY` *(From IAM Phase 2)*
- `AWS_REGION` *(e.g., ap-south-1)*
- `EC2_HOST` *(The Public IPv4 DNS of your EC2 instance)*
- `EC2_SSH_KEY` *(The entire raw text inside your downloaded `.pem` file)*
- `GEMINI_API_KEY` *(Your Gemini API Key)*
- `TAVILY_API_KEY` *(Your Tavily API Key)*
- `GROQ_API_KEY` *(Your Groq API Key)*

### Phase 4: Deploy
Simply commit and push your code to the `main` branch. 
GitHub Actions will automatically SSH into your EC2 instance, install Docker (if missing), inject your secrets into a secure `.env` file, pull the latest image from ECR, and orchestrate the container via `docker-compose`.

---

## 🗺️ Roadmap & Future Capabilities

- **Auth Integration:** Implement JWT-based authentication for user accounts.
- **Mock Interview Context:** Pipe the final generated ATS gap-analysis directly into the AI Interviewer's system prompt to dynamically grill the user on their weakest skills.
- **Cloud Architecture Migration:** Move from a single EC2 instance to an Elastic Container Service (ECS) Fargate cluster for infinite horizontal scaling and zero-downtime rolling updates.
- **WebRTC Upgrade:** Transition the Mock Interview AI from a polling WebSocket setup to real-time WebRTC for lower latency voice interactions.
