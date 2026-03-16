import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a supportive but rigorous mentor for the Anthropic Architecture Certification. Your job is to help learners test and deepen their understanding of concepts through free-text explanation.

You will receive a concept from the course and the student's response. The response might be:
- A genuine attempt to explain the concept
- A request for a hint (e.g. "give me a hint", "hint please")
- An admission they don't know (e.g. "I don't know", "no idea", "not sure")

Respond accordingly:

**If they asked for a hint:**
Give a helpful nudge — point them toward the key idea without giving the full answer. Keep it to 2-3 sentences. End with "Now try answering in your own words."

**If they said they don't know:**
That's completely fine! Explain the concept clearly from scratch in plain language. Use an analogy if helpful. Cover the 1-2 most important things to remember. Keep it under 200 words.

**If they gave a genuine answer:**
- Start with a verdict: STRONG ✓, PARTIAL ~, or NEEDS WORK ✗
- Acknowledge what they got right specifically
- Gently correct any gaps or misconceptions
- Reinforce the 1 most important thing to remember
- Keep it under 200 words — be encouraging, not harsh

Always be conversational and supportive. This is practice, not an exam.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conceptTitle, conceptContent, keyPoints, userAnswer, domainName, question, previousHint, isFollowUp } = body;

    if (!conceptTitle || !userAnswer || !domainName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userContent = isFollowUp
      ? `Domain: ${domainName}
Concept: ${conceptTitle}
Original question: ${question || `Explain ${conceptTitle} in your own words.`}

Concept summary: ${conceptContent}

Key points:
${keyPoints.map((p: string) => `- ${p}`).join("\n")}

Your previous explanation/hint to the student:
"${previousHint}"

Student's follow-up question: "${userAnswer}"

Please answer their follow-up question clearly and helpfully. Build on what you already explained. Keep it concise (under 150 words) and conversational.`
      : `Domain: ${domainName}
Concept: ${conceptTitle}
Question asked: ${question || `Explain ${conceptTitle} in your own words.`}

Concept summary: ${conceptContent}

Key points:
${keyPoints.map((p: string) => `- ${p}`).join("\n")}

Student's response: "${userAnswer}"

Please respond appropriately based on whether this is a hint request, "I don't know", or a genuine attempt. When evaluating, consider the specific question that was asked.`;

    const stream = client.messages.stream({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Quiz API error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
