import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, BookOpen, Sparkles } from "lucide-react";
import { EmotionDetector } from "@/components/journal/EmotionDetector";

const moods = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "calm", label: "Calm", emoji: "😌" },
  { value: "anxious", label: "Anxious", emoji: "😰" },
  { value: "sad", label: "Sad", emoji: "😢" },
  { value: "angry", label: "Angry", emoji: "😠" },
  { value: "excited", label: "Excited", emoji: "🤗" },
  { value: "tired", label: "Tired", emoji: "😴" },
  { value: "stressed", label: "Stressed", emoji: "😫" },
];

const Journal = () => {
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [intensity, setIntensity] = useState([5]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setEntries(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedMood) return;

    setLoading(true);
    setAnalyzing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Analyze the journal entry with AI
      const analysisResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-journal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      const { analysis } = await analysisResponse.json();
      setAnalyzing(false);

      // Save journal entry with analysis
      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        content,
        mood: selectedMood,
        mood_intensity: intensity[0],
        ai_analysis: analysis,
      });

      if (error) throw error;

      // Also save mood log
      await supabase.from("mood_logs").insert({
        user_id: user.id,
        mood: selectedMood,
        intensity: intensity[0],
        notes: content.substring(0, 200),
      });

      toast({
        title: "Journal entry saved!",
        description: "Your thoughts have been recorded securely.",
      });

      setContent("");
      setSelectedMood("");
      setIntensity([5]);
      loadEntries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <AppLayout currentPath="/journal">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            AI Journal & Mood Tracker
          </h1>
          <p className="text-muted-foreground">
            Express yourself freely and track your emotional journey
          </p>
        </div>

        <Card className="shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              New Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="content">What's on your mind?</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write freely about your thoughts, feelings, or experiences..."
                  className="min-h-[200px] mt-2"
                  required
                />
              </div>

              {content.length > 20 && <EmotionDetector text={content} />}

              <div>
                <Label>How are you feeling?</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {moods.map((mood) => (
                    <Button
                      key={mood.value}
                      type="button"
                      variant={selectedMood === mood.value ? "default" : "outline"}
                      onClick={() => setSelectedMood(mood.value)}
                      className="h-auto flex flex-col items-center py-3"
                    >
                      <span className="text-2xl mb-1">{mood.emoji}</span>
                      <span className="text-xs">{mood.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {selectedMood && (
                <div>
                  <Label>Intensity: {intensity[0]}/10</Label>
                  <Slider
                    value={intensity}
                    onValueChange={setIntensity}
                    min={1}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !content.trim() || !selectedMood}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {analyzing ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    Analyzing with AI...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Entry"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {entries.length > 0 && (
          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="border-l-4 border-primary/30 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {moods.find((m) => m.value === entry.mood)?.emoji}
                      </span>
                      <span className="font-medium capitalize">{entry.mood}</span>
                      <span className="text-sm text-muted-foreground">
                        • Intensity: {entry.mood_intensity}/10
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {entry.content}
                  </p>
                  {entry.ai_analysis?.insights && (
                    <p className="text-sm text-accent mt-2 flex items-start gap-1">
                      <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{entry.ai_analysis.insights}</span>
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Journal;
