import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

let emotionClassifier: any = null;

export interface EmotionPrediction {
  label: string;
  score: number;
}

/**
 * Initialize the emotion detection model
 * Uses distilbert-base-uncased-emotion trained on emotion dataset
 */
export async function initEmotionModel() {
  if (emotionClassifier) return emotionClassifier;
  
  console.log('Loading emotion detection model...');
  emotionClassifier = await pipeline(
    'text-classification',
    'bhadresh-savani/distilbert-base-uncased-emotion',
    { device: 'webgpu' }
  );
  console.log('Emotion detection model loaded');
  return emotionClassifier;
}

/**
 * Detect emotions from text using ML model
 * Returns array of emotions with confidence scores
 */
export async function detectEmotions(text: string): Promise<EmotionPrediction[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  try {
    const classifier = await initEmotionModel();
    const results = await classifier(text, { topk: 5 });
    
    // Format results
    return results.map((result: any) => ({
      label: result.label,
      score: Math.round(result.score * 100) / 100
    }));
  } catch (error) {
    console.error('Error detecting emotions:', error);
    throw error;
  }
}

/**
 * Get the primary emotion (highest confidence)
 */
export function getPrimaryEmotion(predictions: EmotionPrediction[]): string {
  if (predictions.length === 0) return 'neutral';
  return predictions[0].label;
}

/**
 * Map emotion labels to emojis
 */
export function getEmotionEmoji(emotion: string): string {
  const emojiMap: Record<string, string> = {
    joy: '😊',
    sadness: '😢',
    anger: '😠',
    fear: '😰',
    love: '❤️',
    surprise: '😲',
    neutral: '😐'
  };
  return emojiMap[emotion.toLowerCase()] || '😐';
}
