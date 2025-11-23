import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Smartphone, Zap, TrendingUp, Lock, Sparkles, ArrowRight, CheckCircle2, Newspaper } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Smartphone,
      title: "Sur WhatsApp",
      description: "Recevez vos actualités directement sur WhatsApp, où vous êtes déjà.",
    },
    {
      icon: Sparkles,
      title: "Personnalisées",
      description: "Choisissez vos thèmes préférés et recevez exactement ce qui vous intéresse.",
    },
    {
      icon: Zap,
      title: "Quotidien ou Hebdo",
      description: "Décidez de la fréquence : chaque jour ou une fois par semaine.",
    },
    {
      icon: TrendingUp,
      title: "Synthèses IA",
      description: "Des résumés intelligents générés par IA pour comprendre rapidement l'essentiel.",
    },
    {
      icon: Lock,
      title: "Privé & Sécurisé",
      description: "Vos données sont protégées et ne sont jamais partagées avec des tiers.",
    },
    {
      icon: Zap,
      title: "Rapide & Efficace",
      description: "Gagnez du temps en lisant uniquement les actualités qui vous importent.",
    },
  ];

  const topics = [
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

  const pricingPlans = [
    {
      name: "Gratuit",
      price: "0€",
      description: "Essayez le service",
      features: [
        "Accès limité aux actualités",
        "1 synthèse par semaine",
        "2 thèmes maximum",
      ],
      cta: "Commencer",
      highlighted: false,
    },
    {
      name: "Premium",
      price: "3,99€",
      period: "/mois",
      description: "Le meilleur rapport qualité-prix",
      features: [
        "Accès illimité aux actualités",
        "Synthèses quotidiennes ou hebdomadaires",
        "Tous les thèmes disponibles",
        "Support prioritaire",
        "Pas de publicités",
      ],
      cta: "S'abonner maintenant",
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold">NewsBot</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm hover:text-primary transition">
              Fonctionnalités
            </a>
            <a href="#topics" className="text-sm hover:text-primary transition">
              Thèmes
            </a>
            <a href="#pricing" className="text-sm hover:text-primary transition">
              Tarification
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => setLocation("/dashboard")}>Tableau de Bord</Button>
            ) : (
              <Button onClick={() => setLocation("/dashboard")}>Se Connecter</Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Vos Actualités Personnalisées sur WhatsApp
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Recevez des synthèses d'actualités intelligentes directement sur WhatsApp. Choisissez vos thèmes, définissez votre fréquence, et restez informé sans surcharge d'informations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" onClick={() => setLocation("/dashboard")}>
              Commencer Gratuitement <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              En Savoir Plus
            </Button>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Smartphone className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                  <p className="text-slate-600 dark:text-slate-400">Aperçu de l'interface WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-slate-100 dark:bg-slate-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pourquoi NewsBot ?</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Tout ce dont vous avez besoin pour rester informé sans effort
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-sm hover:shadow-md transition">
                  <CardHeader>
                    <Icon className="w-8 h-8 text-blue-600 mb-2" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section id="topics" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Choisissez Vos Thèmes</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            10 catégories disponibles pour personnaliser votre expérience
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {topics.map((topic) => (
            <div
              key={topic}
              className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4 text-center hover:shadow-md transition cursor-pointer"
            >
              <p className="font-medium">{topic}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-100 dark:bg-slate-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comment Ça Marche</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { number: "1", title: "Inscrivez-vous", description: "Créez votre compte en quelques secondes" },
              { number: "2", title: "Choisissez", description: "Sélectionnez vos thèmes préférés" },
              { number: "3", title: "Configurez", description: "Définissez votre fréquence d'envoi" },
              { number: "4", title: "Recevez", description: "Obtenez vos synthèses sur WhatsApp" },
            ].map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Tarification Simple</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Choisissez le plan qui vous convient
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.highlighted
                  ? "border-blue-600 shadow-xl scale-105"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Recommandé
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-slate-600 dark:text-slate-400">{plan.period}</span>}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à Rester Informé ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des milliers d'utilisateurs qui reçoivent leurs actualités personnalisées sur WhatsApp
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setLocation("/dashboard")}
            className="gap-2"
          >
            Commencer Maintenant <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">NewsBot</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Vos actualités personnalisées sur WhatsApp
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-primary">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-primary">Tarification</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-primary">Conditions</a></li>
                <li><a href="#" className="hover:text-primary">Confidentialité</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="mailto:support@newsbot.com" className="hover:text-primary">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>&copy; 2025 NewsBot. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


