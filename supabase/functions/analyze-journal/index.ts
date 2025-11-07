import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Analyzing journal entry');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an AI emotion analyst. Analyze the given journal entry and provide insights in JSON format with:
{
  "emotions": ["array", "of", "detected", "emotions"],
  "sentiment": "positive/neutral/negative",
  "themes": ["identified", "themes"],
  "insights": "Brief compassionate observation about the entry",
  "suggestions": ["2-3 brief helpful suggestions"]
}

Be empathetic and supportive in your analysis.`
          },
          {
            role: "user",
            content: `Please analyze this journal entry: ${content}`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content || "{}";
    
    // Parse the JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      emotions: ["neutral"],
      sentiment: "neutral",
      themes: ["general"],
      insights: "Entry logged successfully.",
      suggestions: ["Continue journaling regularly"]
    };

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
