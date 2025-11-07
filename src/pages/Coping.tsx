import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Lightbulb, Sparkles, Clock, Star, Loader2 } from "lucide-react";

const Coping = () => {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [aiStrategies, setAiStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("coping_strategies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setStrategies(data);
    }
  };

  const generatePersonalized = async () => {
    setGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get recent mood logs
      const { data: recentMoods } = await supabase
        .from("mood_logs")
        .select("mood")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const recentEmotions = recentMoods?.map((m) => m.mood) || [];
      const currentMood = recentEmotions[0] || "neutral";

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-coping`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            mood: currentMood,
            recentEmotions,
          }),
        }
      );

      const { strategies: newStrategies } = await response.json();
      setAiStrategies(newStrategies || []);

      toast({
        title: "Strategies generated!",
        description: "Here are some personalized coping techniques for you.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const saveStrategy = async (strategy: any) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("coping_strategies").insert({
        user_id: user.id,
        title: strategy.title,
        description: strategy.description,
        category: strategy.category,
      });

      if (error) throw error;

      toast({
        title: "Strategy saved!",
        description: "Added to your personal toolkit.",
      });

      loadStrategies();
      setAiStrategies(aiStrategies.filter((s) => s.title !== strategy.title));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRating = async (id: string, rating: number) => {
    const { error } = await supabase
      .from("coping_strategies")
      .update({ effectiveness_rating: rating })
      .eq("id", id);

    if (!error) {
      loadStrategies();
      toast({ title: "Rating updated!" });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      breathing: "bg-primary/10 text-primary",
      mindfulness: "bg-accent/10 text-accent",
      physical: "bg-green-500/10 text-green-700 dark:text-green-400",
      social: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      creative: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <AppLayout currentPath="/coping">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Coping Tools & Strategies
            </h1>
            <p className="text-muted-foreground">
              Evidence-based techniques to support your wellbeing
            </p>
          </div>
          <Button
            onClick={generatePersonalized}
            disabled={generating}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Personalized
              </>
            )}
          </Button>
        </div>

        {/* AI Generated Strategies */}
        {aiStrategies.length > 0 && (
          <Card className="shadow-[var(--shadow-soft)] border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI-Personalized Strategies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiStrategies.map((strategy, idx) => (
                <div
                  key={idx}
                  className="border border-border rounded-lg p-4 space-y-3 bg-gradient-to-br from-card to-secondary/5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{strategy.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        {strategy.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getCategoryColor(strategy.category)}>
                          {strategy.category}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {strategy.estimatedTime}
                        </Badge>
                      </div>
                    </div>
                    <Button onClick={() => saveStrategy(strategy)} disabled={loading}>
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Saved Strategies */}
        <Card className="shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Your Toolkit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strategies.length === 0 ? (
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium mb-2">No saved strategies yet</p>
                <p className="text-muted-foreground">
                  Generate personalized strategies to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {strategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{strategy.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {strategy.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getCategoryColor(strategy.category)}>
                            {strategy.category}
                          </Badge>
                          {strategy.times_used > 0 && (
                            <Badge variant="outline">
                              Used {strategy.times_used} times
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rate effectiveness:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateRating(strategy.id, rating)}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                rating <= (strategy.effectiveness_rating || 0)
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Coping;
