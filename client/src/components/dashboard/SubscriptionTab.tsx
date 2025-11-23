import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, CreditCard, Calendar } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export function SubscriptionTab() {
  const { user } = useAuth();
  const { data: subscription, isLoading } = trpc.dashboard.getSubscription.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  const isActive = subscription?.status === "active";
  const daysUntilRenewal = subscription?.currentPeriodEnd
    ? Math.ceil(
        (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isActive ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Abonnement Actif
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Pas d'Abonnement
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isActive
              ? "Vous avez accès à toutes les fonctionnalités premium"
              : "Passez à Premium pour débloquer toutes les fonctionnalités"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isActive && subscription ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Plan</p>
                  <p className="font-semibold">Premium</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Tarif</p>
                  <p className="font-semibold">3,99€/mois</p>
                </div>
              </div>

              {daysUntilRenewal !== null && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Renouvellement</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {daysUntilRenewal} jours restants
                  </p>
                  {subscription.currentPeriodEnd && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Mettre à jour le Paiement
                </Button>
                <Button variant="ghost" className="w-full text-red-600 hover:text-red-700">
                  Annuler l'Abonnement
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">Plan Premium</h3>
                </div>
                <p className="text-2xl font-bold mb-4">3,99€<span className="text-sm font-normal text-slate-600 dark:text-slate-400">/mois</span></p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Accès illimité aux actualités
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Synthèses quotidiennes ou hebdomadaires
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Tous les thèmes disponibles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Support prioritaire
                  </li>
                </ul>
                <Button className="w-full">
                  S'abonner Maintenant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      {isActive && (
        <Card>
          <CardHeader>
            <CardTitle>Historique de Facturation</CardTitle>
            <CardDescription>Vos paiements précédents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Placeholder for billing history */}
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <p>Aucun paiement enregistré</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Questions Fréquentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Puis-je annuler mon abonnement ?</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Oui, vous pouvez annuler votre abonnement à tout moment. Vous conserverez l'accès jusqu'à la fin de votre période de facturation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Quels modes de paiement acceptez-vous ?</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nous acceptons les cartes de crédit (Visa, Mastercard, Amex) via Stripe.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Puis-je changer de plan ?</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Actuellement, nous proposons un seul plan Premium. Contactez notre support pour des besoins spécifiques.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
