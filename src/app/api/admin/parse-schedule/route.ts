import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const body = await request.json();
  const { text } = body;

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a schedule parser. Convert natural language descriptions of availability into structured data.

Given a text describing available mornings, extract:
1. The month being described
2. All specific dates mentioned
3. Any uncertain items that need clarification

Rules:
- Output dates in YYYY-MM-DD format
- Assume the current year if not specified
- For relative dates like "next Friday", calculate the actual date
- If a date is ambiguous (e.g., "next Friday" could mean two different dates), add it to uncertain_items with possible_dates
- Period is always "morning" unless specified otherwise
- Respond with JSON only, no markdown

Example output:
{
  "month": "2026-10",
  "slots": [
    { "date": "2026-10-01", "period": "morning" },
    { "date": "2026-10-03", "period": "morning" }
  ],
  "uncertain_items": []
}`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to parse schedule" },
      { status: 500 }
    );
  }
}
