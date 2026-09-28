# DocIntel AI

DocIntel AI is an AI-powered document analysis workspace built to make it easier to understand and interact with PDF documents.

Users can upload a PDF, generate an AI-powered analysis, and ask questions grounded in the contents of the uploaded document.

## Features

- PDF document upload
- AI-powered document analysis
- Document summaries and key insights
- Grounded document Q&A
- Loading and error handling
- Responsive interface
- Server-side Gemini integration
- Secure environment variable handling

## Tech Stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Google Gemini API
- Google GenAI SDK
- Vercel

## How It Works

1. Upload a PDF document.
2. The document is securely sent to a server-side API route.
3. Gemini analyses the document and generates key insights.
4. Users can ask questions about the document.
5. Answers are generated using the uploaded document as context.

## Security

API credentials are stored using server-side environment variables and are never exposed to the browser or committed to the repository.

Uploaded documents are processed for analysis and are not stored by the application.

## Local Development

Install dependencies:

```bash
npm install