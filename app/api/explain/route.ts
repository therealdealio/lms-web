import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LMS_MODEL } from "@/lib/env";

const getClient = () => new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are an expert mentor for the Anthropic Architecture Certification. Your role is to help engineers understand Claude Code, Claude Agent SDK, Claude API, and MCP. Be encouraging but precise. When evaluating answers, be specific about what's correct and what needs improvement. Use concrete code examples from the Anthropic ecosystem.

When explaining concepts:
1. Start with a clear, simple one-sentence summary
2. Use an analogy if helpful
3. Give a concrete technical explanation
4. Include a short code example if relevant (TypeScript/JavaScript preferred)
5. End with what to remember for the exam
Be thorough but scannable — use bullet points and short paragraphs.`;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { concept, domain, userQuestion, context } = body;

    if (!concept || !domain || !userQuestion) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: concept, domain, userQuestion" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userContent = `Domain: ${domain}
${context ? `Context: ${context}` : ""}

User's Question: ${userQuestion}

Please explain this concept clearly for someone preparing for the Anthropic Architecture Certification.`;

    const stream = getClient().messages.stream({
      model: LMS_MODEL,
      max_tokens: 800,
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
    console.error("Explain API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
