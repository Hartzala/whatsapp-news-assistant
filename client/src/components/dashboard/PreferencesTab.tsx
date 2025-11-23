import { useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const AVAILABLE_TOPICS = [
  "Technologie",
  "Finance",
  "Sport",
  "Politique",
  "Santé",
  "Environnement",
  "Divertissement",
  "Science",
  "Affaires",
  "Voyages",
];

export default function PreferencesTab() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<"daily" | "weekly">("weekly");

  // Fetch current preferences
  const { data: preferences, isLoading: preferencesLoading } = trpc.dashboard.getPreferences.useQuery();

  // Update preferences mutation
  const updatePreferencesMutation = trpc.dashboard.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Préférences mises à jour avec succès");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  // Initialize form when preferences load
  React.useEffect(() => {
    if (preferences) {
      try {
        const topics = typeof preferences.topics === "string" 
          ? JSON.parse(preferences.topics) 
          : preferences.topics || [];
        setSelectedTopics(Array.isArray(topics) ? topics : []);
        setFrequency((preferences.frequency as "daily" | "weekly") || "weekly");
      } catch (e) {
        setSelectedTopics([]);
      }
    }
  }, [preferences]);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSave = async () => {
    if (selectedTopics.length === 0) {
      toast.error("Sélectionnez au moins un thème");
      return;
    }

    updatePreferencesMutation.mutate({
      topics: selectedTopics,
      frequency,
    });
  };

  if (preferencesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Topics Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sélectionnez vos thèmes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choisissez les sujets pour lesquels vous souhaitez recevoir des synthèses d'actualités.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AVAILABLE_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => handleTopicToggle(topic)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedTopics.includes(topic)
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{topic}</span>
                {selectedTopics.includes(topic) && <Check className="w-4 h-4" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Frequency Selection */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Fréquence d'envoi</h3>
        <p className="text-sm text-muted-foreground mb-4">
          À quelle fréquence souhaitez-vous recevoir vos synthèses ?
        </p>
        <RadioGroup value={frequency} onValueChange={(value: string) => setFrequency(value as "daily" | "weekly")}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily" className="flex-1 cursor-pointer">
                <div className="font-medium">Quotidien</div>
                <div className="text-sm text-muted-foreground">Recevez une synthèse chaque jour à 8h00</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                <div className="font-medium">Hebdomadaire</div>
                <div className="text-sm text-muted-foreground">Recevez une synthèse chaque lundi à 8h00</div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          onClick={handleSave}
          disabled={updatePreferencesMutation.isPending}
          size="lg"
        >
          {updatePreferencesMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Enregistrer les modifications
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Conseil :</strong> Vous pouvez modifier vos préférences à tout moment. Les synthèses suivantes seront générées selon vos nouveaux paramètres.
        </p>
      </div>
    </div>
  );
}
