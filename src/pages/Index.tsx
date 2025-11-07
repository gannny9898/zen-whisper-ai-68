import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, BarChart3, Lightbulb, Shield, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        navigate("/chat");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        navigate("/chat");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="animate-pulse text-center">
          <Brain className="w-16 h-16 mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iaHNsKHZhcigtLWJvcmRlcikpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)] mb-4">
              <Brain className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Your AI Mental Health Companion
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A safe, compassionate space for emotional support, self-reflection, and personal growth powered by AI
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => document.getElementById("auth")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8"
              >
                Get Started Free
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive AI-powered tools designed to support your emotional journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Brain,
                title: "AI Therapist",
                description: "Chat with a compassionate AI companion trained in therapeutic techniques",
                gradient: "from-primary to-accent",
              },
              {
                icon: BookOpen,
                title: "Smart Journal",
                description: "AI-powered insights on your thoughts and emotions with mood tracking",
                gradient: "from-accent to-primary",
              },
              {
                icon: BarChart3,
                title: "Emotion Dashboard",
                description: "Visualize your emotional patterns and track your wellbeing over time",
                gradient: "from-primary to-accent",
              },
              {
                icon: Lightbulb,
                title: "Coping Strategies",
                description: "Personalized evidence-based techniques tailored to your needs",
                gradient: "from-accent to-primary",
              },
              {
                icon: Shield,
                title: "Privacy First",
                description: "Your data is encrypted and secure with enterprise-grade protection",
                gradient: "from-primary to-accent",
              },
              {
                icon: Sparkles,
                title: "AI-Powered Growth",
                description: "Continuous learning and personalization based on your journey",
                gradient: "from-accent to-primary",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-2xl border border-border bg-card hover:shadow-[var(--shadow-soft)] transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="auth" className="py-20 bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <AuthForm />
        </div>
      </section>
    </div>
  );
};

export default Index;
