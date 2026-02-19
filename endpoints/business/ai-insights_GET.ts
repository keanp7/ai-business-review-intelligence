import { schema, OutputType } from "./ai-insights_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const input = schema.parse(queryParams);

    // 1. Fetch business and reviews
    const business = await db.selectFrom('businesses')
      .selectAll()
      .where('id', '=', input.businessId)
      .executeTakeFirst();

    if (!business) {
      return new Response(superjson.stringify({ error: "Business not found" }), { status: 404 });
    }

    const reviews = await db.selectFrom('reviews')
      .selectAll()
      .where('businessId', '=', input.businessId)
      .orderBy('createdAt', 'desc')
      .limit(50) // Limit to last 50 reviews to avoid token limits
      .execute();

    if (reviews.length === 0) {
        // Return empty/default insights if no reviews
        const emptyInsights: OutputType = {
            trustScore: 50,
            sentimentBreakdown: { positive: 0, negative: 0, neutral: 100, mixed: 0 },
            pricingPerception: "No customer feedback about pricing yet.",
            overallSummary: "No reviews available yet to generate insights.",
            strengths: [],
            weaknesses: [],
            recommendationScore: 0,
            dataConfidence: 'low',
            totalReviews: 0,
            trustMessage: "No reviews available to generate a trust score."
        };
        return new Response(superjson.stringify(emptyInsights));
    }

    // 2. Call Google Gemini for insights
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
    }

    const systemPrompt = "You are an expert business intelligence analyst. Provide objective, data-driven insights based on customer reviews.";
    
    const userPrompt = `
      Analyze the following business and its reviews to provide structured insights.
      
      Business: ${business.name} (${business.category})
      Description: ${business.description || 'N/A'}
      
      Reviews (latest ${reviews.length}):
      ${reviews.map(r => `- Rating: ${r.rating}/5, Content: "${r.content}"`).join('\n')}
      
      Provide the output in JSON format with the following structure:
      {
        "trustScore": number (0-100),
        "sentimentBreakdown": { "positive": number, "negative": number, "neutral": number, "mixed": number } (percentages adding up to 100),
        "pricingPerception": string (e.g. "Premium", "Fair", "Budget-Friendly", "Mixed"),
        "overallSummary": string (2-3 sentences),
        "strengths": string[] (top 3),
        "weaknesses": string[] (top 3),
        "recommendationScore": number (0-10)
      }
    `;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt + "\n\n" + userPrompt }
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        throw new Error(`Gemini API error: ${errorText}`);
    }

    const data = await geminiResponse.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
        throw new Error("Failed to generate insights from Gemini");
    }

    const insights = JSON.parse(content);

    // Apply trust score capping logic
    if (reviews.length < 5) {
      insights.trustScore = Math.min(insights.trustScore, 80);
    }

    // Calculate data confidence
    let dataConfidence: 'low' | 'medium' | 'high';
    if (reviews.length <= 2) {
      dataConfidence = 'low';
    } else if (reviews.length <= 5) {
      dataConfidence = 'medium';
    } else {
      dataConfidence = 'high';
    }

    // Generate trust message
    let trustMessage: string | null = null;
    if (reviews.length < 3) {
      trustMessage = "This score is based on limited early feedback.";
    } else if (reviews.length < 5) {
      trustMessage = "Score capped at 80 due to limited review data.";
    }

    // Add new fields to the response
    const enrichedInsights: OutputType = {
      ...insights,
      dataConfidence,
      totalReviews: reviews.length,
      trustMessage
    };

    return new Response(superjson.stringify(enrichedInsights satisfies OutputType));

  } catch (error) {
    return new Response(superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 400 });
  }
}