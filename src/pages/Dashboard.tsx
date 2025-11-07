import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, Heart, Brain } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const [moodData, setMoodData] = useState<any[]>([]);
  const [emotionDistribution, setEmotionDistribution] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    averageMood: 0,
    mostCommonMood: "",
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load mood logs for chart
    const { data: moodLogs } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(14);

    if (moodLogs) {
      const chartData = moodLogs.map((log) => ({
        date: new Date(log.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        intensity: log.intensity,
        mood: log.mood,
      }));
      setMoodData(chartData);

      // Calculate stats
      const moodCounts: Record<string, number> = {};
      let totalIntensity = 0;

      moodLogs.forEach((log) => {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
        totalIntensity += log.intensity;
      });

      const mostCommon = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

      setStats({
        totalEntries: moodLogs.length,
        averageMood: parseFloat((totalIntensity / moodLogs.length).toFixed(1)),
        mostCommonMood: mostCommon?.[0] || "N/A",
      });

      // Prepare emotion distribution
      const distribution = Object.entries(moodCounts).map(([mood, count]) => ({
        name: mood,
        value: count,
      }));
      setEmotionDistribution(distribution);
    }
  };

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(174, 62%, 67%)",
    "hsl(260, 60%, 75%)",
    "hsl(204, 70%, 63%)",
  ];

  return (
    <AppLayout currentPath="/dashboard">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Emotion Analysis Dashboard
          </h1>
          <p className="text-muted-foreground">Track your emotional wellbeing over time</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-[var(--shadow-soft)]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalEntries}</p>
                </div>
                <Brain className="w-12 h-12 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Intensity</p>
                  <p className="text-3xl font-bold text-accent">{stats.averageMood}/10</p>
                </div>
                <TrendingUp className="w-12 h-12 text-accent/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Most Common</p>
                  <p className="text-2xl font-bold capitalize">{stats.mostCommonMood}</p>
                </div>
                <Heart className="w-12 h-12 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mood Trend Chart */}
        {moodData.length > 0 && (
          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Mood Intensity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Emotion Distribution */}
        {emotionDistribution.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle>Emotion Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={emotionDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {emotionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle>Mood Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={emotionDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {moodData.length === 0 && (
          <Card className="shadow-[var(--shadow-soft)]">
            <CardContent className="py-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium mb-2">No data yet</p>
              <p className="text-muted-foreground">
                Start journaling to see your emotional insights and trends
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
