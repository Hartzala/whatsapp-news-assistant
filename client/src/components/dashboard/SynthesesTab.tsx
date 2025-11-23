import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function SynthesesTab() {
  const { data: syntheses, isLoading } = trpc.dashboard.getSyntheses.useQuery({});

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!syntheses || syntheses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Aucune synthèse reçue</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Vous recevrez vos premières synthèses d'actualités une fois votre abonnement activé.
            </p>
            <Button variant="outline">Configurer mes préférences</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {syntheses.map((synthesis) => (
        <Card key={synthesis.id} className="hover:shadow-md transition">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(synthesis.createdAt).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">
                  Synthèse du {new Date(synthesis.createdAt).toLocaleDateString("fr-FR")}
                </h3>
              </div>
              <Badge variant={synthesis.sentAt ? "default" : "secondary"}>
                {synthesis.sentAt ? "Envoyée" : "En attente"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Topics */}
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Thèmes couverts
              </p>
              <div className="flex flex-wrap gap-2">
                {synthesis.topics?.split(",").map((topic) => (
                  <Badge key={topic} variant="outline">
                    {topic.trim()}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preview */}
            {synthesis.content && (
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Aperçu
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                  {synthesis.content.substring(0, 200)}...
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Articles</p>
                <p className="font-semibold">{synthesis.articleCount || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Mots</p>
                <p className="font-semibold">{synthesis.content?.split(" ").length || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Temps de lecture</p>
                <p className="font-semibold">
                  {Math.ceil((synthesis.content?.split(" ").length || 0) / 200)} min
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1 gap-2">
                <FileText className="w-4 h-4" />
                Voir la synthèse
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
