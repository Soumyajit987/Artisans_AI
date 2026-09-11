Markdown
# KARIGARAI Computer Vision API

A production-grade, asynchronous computer vision microservice optimized for artisan e-commerce product image enhancement. It automatically handles EXIF orientation, memory-safe downscaling, precise AI background removal (`bria-rmbg`), and studio-white canvas composition.

## Project Structure

```text
karigarai-cv-service/
├── vision_ai.py    # Core CV engine and image processing logic
├── main.py         # FastAPI web server and route controllers
├── requirements.txt# Python dependency manifest
└── README.md       # Integration and deployment guide
Setup & Installation
Ensure you are running Python 3.9+.

Clone the repository and navigate into the project directory.

Install the required dependencies:

Bash
pip install -r requirements.txt
Running the Server
Start the live FastAPI server locally using Uvicorn with hot-reload enabled:

Bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
Note: The underlying ONNX model (bria-rmbg) is loaded into server RAM globally upon initial startup to eliminate latency on subsequent requests.

API Endpoints
1. Single Image Enhancement
URL: POST /api/v1/enhance

Content-Type: multipart/form-data

Form Field: file (Accepts JPEG, PNG, WEBP, AVIF, HEIC)

Response: Optimized JPEG image byte stream (image/jpeg)

2. Batch Image Processing
URL: POST /api/v1/enhance-batch

Content-Type: multipart/form-data

Form Field: files (Multiple image files)

Response: JPEG image byte stream of the first processed sample (or extendable to ZIP buffer).

3. Health Check
URL: GET /health

Response: {"status": "online", "service": "KARIGARAI CV Engine Active"}

Interactive Documentation
Once the server is active, you can test endpoints directly in your browser using the built-in Swagger UI:
👉 http://localhost:8000/docs

Production Deployment Notes
Concurrency: CPU-heavy PIL transformations and ONNX inferences are offloaded using Starlette's run_in_threadpool in main.py to prevent blocking the asynchronous event loop.

Server Sizing: Allocate a minimum of 1GB to 2GB RAM per worker instance to ensure smooth matrix processing for high-resolution uploads.