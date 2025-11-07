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
    const { mood, recentEmotions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Generating coping strategies for mood:', mood);

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
            content: `You are a mental health support AI. Generate personalized coping strategies based on user's current emotional state. 

Provide 4-5 evidence-based coping strategies in JSON format:
{
  "strategies": [
    {
      "title": "Strategy name",
      "description": "Detailed description of the coping technique",
      "category": "breathing/mindfulness/physical/social/creative",
      "estimatedTime": "5-10 minutes"
    }
  ]
}

Make strategies practical, actionable, and tailored to the user's mood.`
          },
          {
            role: "user",
            content: `Current mood: ${mood}. Recent emotions: ${recentEmotions?.join(', ') || 'varied'}. Please suggest coping strategies.`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const strategiesText = data.choices?.[0]?.message?.content || "{}";
    
    // Parse the JSON from the response
    const jsonMatch = strategiesText.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      strategies: [
        {
          title: "Deep Breathing Exercise",
          description: "Practice 4-7-8 breathing: Inhale for 4 counts, hold for 7, exhale for 8. Repeat 3-4 times.",
          category: "breathing",
          estimatedTime: "5 minutes"
        }
      ]
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
