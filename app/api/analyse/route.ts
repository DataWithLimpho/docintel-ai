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
Analyse this document.

Return a useful, concise analysis containing:

1. A short summary
2. The main topics
3. Important facts or findings
4. Key takeaways
5. Suggested questions someone could ask about the document

Only use information contained in the uploaded document.
If something cannot be determined from the document, do not invent it.
              `,
            },
          ],
        },
      ],
    });

    const analysis = response.text;

    if (!analysis) {
      throw new Error("Gemini returned an empty response.");
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Document analysis failed:", error);

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
        error: "Unable to analyse the document. Please try again.",
      },
      { status: 500 }
    );
  }
}