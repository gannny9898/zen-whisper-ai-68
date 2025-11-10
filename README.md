# AI Mental Health Companion

An intelligent mental health support application powered by AI, providing personalized therapy conversations, mood tracking, emotion analysis, and coping strategies.

## Features

- **🤖 Conversational AI Therapist**: Chat with an empathetic AI therapist powered by advanced language models
- **📔 AI Journal & Mood Tracker**: Document your thoughts with real-time emotion detection using ML models
- **📊 Emotion Analysis Dashboard**: Visualize mood patterns and emotional trends over time
- **💡 Personalized Coping Recommendations**: Get AI-generated coping strategies based on your emotional state
- **🔒 Privacy & Security**: All data is encrypted and secured with row-level security policies
- **🧠 Real-time Emotion Detection**: Browser-based ML model (DistilBERT) analyzes text emotions without sending data to servers

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling with custom design system
- **Shadcn UI** components
- **React Query** for data management
- **React Router** for navigation

### Backend & AI
- **Lovable Cloud** (Supabase) for backend infrastructure
- **PostgreSQL** database with Row Level Security
- **Edge Functions** for serverless AI processing
- **HuggingFace Transformers** for client-side emotion detection
- **Google Gemini & OpenAI GPT** models for AI conversations

### ML Models
- **Emotion Detection**: `bhadresh-savani/distilbert-base-uncased-emotion` (trained on GoEmotions dataset)
- Analyzes 6 emotions: joy, sadness, anger, fear, love, surprise

## Project URL

**Lovable Project**: https://lovable.dev/projects/8e8e5235-1840-47a5-bb1c-71246379c4f8

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8e8e5235-1840-47a5-bb1c-71246379c4f8) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8e8e5235-1840-47a5-bb1c-71246379c4f8) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
