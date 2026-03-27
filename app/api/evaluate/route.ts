import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { LMS_MODEL } from "@/lib/env";

const getClient = () => new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are an expert mentor for the Anthropic Architecture Certification. Your role is to help engineers understand Claude Code, Claude Agent SDK, Claude API, and MCP. Be encouraging but precise. When evaluating answers, be specific about what's correct and what needs improvement. Use concrete code examples from the Anthropic ecosystem when helpful.

When evaluating a user's answer:
1. Start with a clear verdict: CORRECT ✓, PARTIALLY CORRECT ~, or INCORRECT ✗
2. Explain what they got right
3. Explain what needs improvement or clarification
4. Reinforce the key concept with a clear explanation
5. If relevant, mention the common exam trap associated with this topic
Keep responses concise but complete — aim for 150-250 words.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, userAnswer, domain, correctAnswer } = body;

    if (!question || !userAnswer || !domain) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: question, userAnswer, domain" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userContent = `Domain: ${domain}

Question: ${question}
${correctAnswer ? `Correct Answer: ${correctAnswer}` : ""}

Student's Answer: ${userAnswer}

Please evaluate whether the student's answer demonstrates correct understanding of this concept. Be specific and educational.`;

    const stream = getClient().messages.stream({
      model: LMS_MODEL,
      max_tokens: 600,
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
              const data = JSON.stringify({ text: event.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
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
    console.error("Evaluate API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
