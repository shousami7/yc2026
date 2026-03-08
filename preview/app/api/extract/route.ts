import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { LayoutJSON } from "@/components/bim/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert architectural drawing analysis AI.
Your job is to extract the structural layout from a floor plan image.

Return ONLY valid JSON matching this schema exactly:
{
  "scale": number,        // estimated meters per pixel, or 1 if unknown
  "walls": [{
    "id": string,
    "start": {"x": number, "y": number},
    "end": {"x": number, "y": number},
    "thickness": number,  // meters, typically 0.1–0.3
    "height": number      // meters, default 2.8
  }],
  "doors": [{
    "id": string,
    "position": {"x": number, "y": number},
    "width": number,      // meters, typically 0.8–1.0
    "rotation": number,   // radians
    "wall_id": string | null
  }],
  "windows": [{
    "id": string,
    "position": {"x": number, "y": number},
    "width": number,      // meters
    "height": number,     // meters, typically 1.0–1.5
    "sill_height": number, // meters from floor, typically 0.8–1.0
    "wall_id": string | null
  }],
  "rooms": [{
    "id": string,
    "name": string,       // e.g. "Living Room", "Bedroom 1", "Kitchen"
    "polygon": [{"x": number, "y": number}]  // floor outline vertices in order
  }]
}

Rules:
- Use real-world meter coordinates (not pixels). Estimate scale from context clues like door widths (~0.9m) or room sizes.
- x = horizontal (east), y = vertical (south)
- Walls are straight line segments. Ignore furniture and annotations.
- If you cannot detect something, return an empty array for that key.
- Return ONLY the JSON object. No markdown, no explanation.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  let imageBase64: string;
  let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    imageBase64 = Buffer.from(bytes).toString("base64");

    const type = file.type;
    if (type === "image/jpeg" || type === "image/jpg") {
      mediaType = "image/jpeg";
    } else if (type === "image/png") {
      mediaType = "image/png";
    } else if (type === "image/webp") {
      mediaType = "image/webp";
    } else if (type === "application/pdf") {
      // For MVP: reject PDFs with a helpful message
      return NextResponse.json(
        { error: "PDF not yet supported. Please upload a PNG or JPG of your floor plan." },
        { status: 400 }
      );
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to read file" }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "Extract the floor plan layout from this image. Return the JSON schema.",
            },
          ],
        },
      ],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip markdown code fences if present
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    let layout: LayoutJSON;
    try {
      layout = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse LLM output:", rawText);
      return NextResponse.json(
        { error: "AI returned invalid JSON. Try a clearer floor plan image." },
        { status: 422 }
      );
    }

    // Normalize IDs if missing
    layout.walls = (layout.walls || []).map((w, i) => ({ ...w, id: w.id || `w${i}` }));
    layout.doors = (layout.doors || []).map((d, i) => ({ ...d, id: d.id || `d${i}` }));
    layout.windows = (layout.windows || []).map((win, i) => ({ ...win, id: win.id || `win${i}` }));
    layout.rooms = (layout.rooms || []).map((r, i) => ({ ...r, id: r.id || `r${i}` }));
    layout.scale = layout.scale || 1;

    return NextResponse.json({ layout });
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "AI extraction failed" }, { status: 500 });
  }
}
