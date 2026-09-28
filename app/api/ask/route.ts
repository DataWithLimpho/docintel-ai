import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const question = formData.get("question");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No PDF was provided." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF documents are supported." },
        { status: 400 }
      );
    }

    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "Please enter a question." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64,
              },
            },
            {
              text: `
Answer the following question using only information contained
in the uploaded document.

Question:
${question}

Rules:
- Ground the answer in the document.
- Do not invent information.
- If the document does not contain enough information to answer,
  clearly say so.
- Keep the answer clear and concise.
              `,
            },
          ],
        },
      ],
    });

    const answer = response.text;

    if (!answer) {
      throw new Error("Gemini returned an empty response.");
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Document question failed:", error);

    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : 500;

    if (status === 503) {
      return NextResponse.json(
        {
          error:
            "Gemini is experiencing high demand. Please wait a moment and try again.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to answer the question. Please try again.",
      },
      { status: 500 }
    );
  }
}