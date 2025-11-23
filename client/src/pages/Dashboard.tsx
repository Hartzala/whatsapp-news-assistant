import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, Newspaper, Settings, CreditCard, History } from "lucide-react";
import { trpc } from "@/lib/trpc";
import PreferencesTab from "@/components/dashboard/PreferencesTab";
import { SynthesesTab } from "@/components/dashboard/SynthesesTab";
import { SubscriptionTab } from "@/components/dashboard/SubscriptionTab";

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
    }
  }, [loading, isAuthenticated, setLocation]);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
              <p className="text-sm text-muted-foreground mt-1">Gérez vos préférences d'actualités</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                setLocation("/");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Topics Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Thèmes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.topicsCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">thèmes configurés</p>
            </CardContent>
          </Card>

          {/* Frequency Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fréquence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {stats?.frequency === "daily" ? "Quotidien" : "Hebdo"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">d'envoi</p>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Abonnement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats?.isSubscribed ? "text-green-600" : "text-red-600"}`}>
                {stats?.isSubscribed ? "✓ Actif" : "✗ Inactif"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">3,99€/mois</p>
            </CardContent>
          </Card>

          {/* Syntheses Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Synthèses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.synthesisCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">reçues</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="w-full justify-start border-b bg-transparent p-0 rounded-none">
              <TabsTrigger
                value="preferences"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Settings className="w-4 h-4 mr-2" />
                Préférences
              </TabsTrigger>
              <TabsTrigger
                value="syntheses"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <History className="w-4 h-4 mr-2" />
                Historique
              </TabsTrigger>
              <TabsTrigger
                value="subscription"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Abonnement
              </TabsTrigger>
            </TabsList>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="p-6 space-y-4">
              <PreferencesTab />
            </TabsContent>

            {/* Syntheses Tab */}
            <TabsContent value="syntheses" className="p-6 space-y-4">
              <SynthesesTab />
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="p-6 space-y-4">
              <SubscriptionTab />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
