Markdown
# KARIGARAI NLP & GenAI Service

An intelligent pipeline designed to bridge rural artisans and digital marketplaces. It ingests voice notes, performs accurate speech-to-text transcription, handles language detection and translation, and structures outputs via strict schema validation to prevent fake claims.

## Setup & Installation

1. Set your OpenAI API key in your environment variables:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
Install dependencies:

Bash
pip install -r requirements.txt
Running the Server
Bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
API Endpoint
URL: POST /api/voice/process

Form Field: file (Audio file)

Query Parameter: target_language (e.g., en, bn, hi)

Response: JSON matching the strict ArtisanListing schema containing verified titles, descriptions, and anti-hallucinated facts.


What specific language or audio format will your mobile application team be sending to this