"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProfileViewProps {
  profile: {
    email: string;
    display_name?: string;
    phone?: string;
    created_at: string;
  } | null;
  survey: {
    health_goals: string[];
    sleep_quality: number;
    exercise_frequency: string;
    stress_level: number;
    focus_areas: string[];
  } | null;
  activeProtocols: {
    id: string;
    protocols: { title: string; category: string };
  }[];
}

export function ProfileView({
  profile,
  survey,
  activeProtocols,
}: ProfileViewProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{profile?.email}</span>
          </div>
          {profile?.phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{profile.phone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member since</span>
            <span>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      {survey && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Health Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Goals</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {survey.health_goals.map((g) => (
                  <Badge key={g} variant="secondary">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Sleep Quality</span>
                <p className="font-medium">{survey.sleep_quality}/10</p>
              </div>
              <div>
                <span className="text-muted-foreground">Stress Level</span>
                <p className="font-medium">{survey.stress_level}/10</p>
              </div>
              <div>
                <span className="text-muted-foreground">Exercise</span>
                <p className="font-medium">{survey.exercise_frequency}</p>
              </div>
            </div>
            <Separator />
            <div>
              <span className="text-sm text-muted-foreground">Focus Areas</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {survey.focus_areas.map((a) => (
                  <Badge key={a} variant="outline">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeProtocols.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Protocols</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeProtocols.map((up) => (
                <div
                  key={up.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{up.protocols.title}</span>
                  <Badge variant="secondary">{up.protocols.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" onClick={handleSignOut} className="w-full">
        Sign Out
      </Button>
    </div>
  );
}
