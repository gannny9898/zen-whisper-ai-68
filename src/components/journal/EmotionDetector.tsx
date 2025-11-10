import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2 } from "lucide-react";
import { detectEmotions, getEmotionEmoji, type EmotionPrediction } from "@/lib/emotionDetection";
import { Badge } from "@/components/ui/badge";

interface EmotionDetectorProps {
  text: string;
}

export const EmotionDetector = ({ text }: EmotionDetectorProps) => {
  const [emotions, setEmotions] = useState<EmotionPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    if (text.trim().length < 20) {
      setEmotions([]);
      return;
    }

    const detectWithDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await detectEmotions(text);
        setEmotions(results);
        setModelLoaded(true);
      } catch (error) {
        console.error('Emotion detection failed:', error);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(detectWithDebounce);
  }, [text]);

  if (!modelLoaded && !loading && emotions.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          Real-time Emotion Detection (ML Model)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing emotions...
          </div>
        ) : emotions.length > 0 ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {emotions.map((emotion, idx) => (
                <Badge 
                  key={idx} 
                  variant={idx === 0 ? "default" : "secondary"}
                  className="gap-1"
                >
                  <span>{getEmotionEmoji(emotion.label)}</span>
                  <span className="capitalize">{emotion.label}</span>
                  <span className="text-xs opacity-70">
                    {Math.round(emotion.score * 100)}%
                  </span>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Powered by DistilBERT emotion classification model trained on emotion datasets
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Write at least 20 characters to see emotion analysis
          </p>
        )}
      </CardContent>
    </Card>
  );
};
