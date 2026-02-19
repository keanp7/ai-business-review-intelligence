import { schema, OutputType } from "./chat_POST.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
    }

    const systemContext = "You are TrueLency's AI assistant, an expert in business intelligence, review analysis, and trust assessment. Help users understand business trust scores, sentiment analysis, pricing perceptions, and general questions about the TrueLency platform. Be helpful, concise, and data-driven in your responses.";

    // Construct the prompt with history
    let fullPrompt = `${systemContext}\n\n`;
    
    if (input.conversationHistory && input.conversationHistory.length > 0) {
      fullPrompt += "Conversation History:\n";
      input.conversationHistory.forEach(msg => {
        fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      fullPrompt += "\n";
    }

    fullPrompt += `User: ${input.message}\nAssistant:`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: fullPrompt }
          ]
        }]
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const data = await geminiResponse.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      throw new Error("Failed to generate response from Gemini");
    }

    return new Response(superjson.stringify({ reply } satisfies OutputType));
  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}