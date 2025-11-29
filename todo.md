# WhatsApp News Assistant - Todo List

## Phase 1: MVP de Base
- [x] Configuration Supabase et modèles de données
- [x] Intégration WhatsApp Cloud API (webhook)
- [x] Gestion basique des utilisateurs et abonnements
- [x] Intégration NewsAPI.ai pour récupération d'articles
- [x] Intégration IA (GPT) pour génération de synthèses

## Phase 2: Paiement et Personnalisation
- [x] Intégration Stripe Billing (abonnements)
- [x] Webhooks Stripe pour gestion des statuts d'abonnement
- [x] Commandes WhatsApp pour choisir les thèmes
- [x] Commandes WhatsApp pour choisir la fréquence (quotidien/hebdo)
- [x] Gestion du statut d'abonnement dans la base de données

## Phase 3: Automatisation des Synthèses
- [x] Mise en place du Scheduler (Cron)
- [x] Script de génération automatique de synthèses
- [x] Gestion des fuseaux horaires
- [x] Envoi automatique des synthèses via WhatsApp

## Phase 4: Optimisations et Lancement
- [x] Tests et validation du MVP
- [x] Optimisations de performance
- [x] Documentation et instructions de déploiement
- [ ] Lancement en production

## Phase 5: Frontend et Interface Utilisateur
- [ ] Créer une page d'accueil pour l'inscription
- [ ] Tableau de bord utilisateur pour gérer les préférences
- [ ] Historique des synthèses reçues
- [ ] Gestion du profil et des paramètres d'abonnement

## Phase 6: Développement du Tableau de Bord Web
- [x] Page d'accueil du tableau de bord
- [x] Composant de gestion des thémes
- [x] Composant de gestion de la fréquence
- [ ] Page d'historique des synthéses
- [ ] Page de gestion de l'abonnement
- [ ] Intégration Stripe pour les paiements
- [x] Procédures tRPC pour le tableau de bord
- [x] Tests unitaires pour le tableau de bord (14 tests passants)

## Fichiers de Documentation Créés
- [x] README.md - Documentation complète du projet
- [x] QUICKSTART.md - Guide de démarrage rapide
- [x] WHATSAPP_SETUP.md - Configuration WhatsApp
- [x] DEPLOYMENT.md - Guide de déploiement
- [x] Tests unitaires (vitest) - 13 tests passant

## Phase 7: Refactorisation IA du Gestionnaire WhatsApp
- [x] Service de gestion du contexte utilisateur
- [x] Système de compréhension d'intentions avec IA
- [x] Refactorisation du gestionnaire de messages avec IA
- [x] Présentation automatique au premier message
- [x] Tests du nouveau système (16 tests passants)


## Phase 8: Interface Utilisateur - Landing Page et Dashboard
- [x] Créer une landing page attrayante
- [x] Améliorer le design du dashboard
- [x] Ajouter la page d'historique des synthéses
- [x] Ajouter la page de gestion de l'abonnement
- [ ] Intégrer Stripe pour les paiements
- [x] 43 tests passants (14 dashboard + 16 whatsappAi + 13 services)


## Phase 9: Intégration NewsAPI.ai Réelle
- [x] Mettre à jour le service newsApi.ts avec les vrais paramètres
- [x] Implémenter la recherche par thème (Technologie, Finance, Sport, etc.)
- [x] Implémenter la génération de synthèses avec articles réels
- [x] Tester la récupération et la génération de synthèses (43 tests passants)
- [ ] Intégrer Stripe pour les paiements


## Phase 10: Refactorisation Twilio + OpenAI + Railway
- [x] Rechercher la documentation Twilio WhatsApp API
- [x] Rechercher la documentation Railway pour le déploiement
- [x] Remplacer WhatsApp Cloud API par Twilio WhatsApp
- [x] Remplacer le système de synthèse par OpenAI
- [x] Créer la configuration Railway (railway.json)
- [x] Mettre à jour les variables d'environnement (.env.railway.example)
- [x] Tester la nouvelle architecture (43 tests passants)
- [x] Créer la documentation de déploiement Railway


## Phase 11: Intégration Stripe
- [x] Créer un compte Stripe et obtenir les clés API
- [x] Créer le produit Premium (3,99€/mois) dans Stripe Dashboard
- [x] Implémenter les endpoints Stripe Checkout
- [x] Implémenter les webhooks Stripe (subscription events)
- [x] Connecter les webhooks aux tables subscriptions
- [ ] Tester le flux de paiement complet
- [ ] Mettre à jour l'interface utilisateur avec les liens de paiement


## Phase 12: Configuration Modèle Freemium
- [x] Analyser la configuration actuelle
- [x] Ajuster le gestionnaire IA pour supporter le modèle freemium
- [x] Implémenter la réponse aux questions gratuites en temps réel (limite 5/jour)
- [x] Vérifier l'abonnement avant d'envoyer des résumés (scheduler vérifie status=active)
- [x] Ajuster le scheduler pour résumés quotidiens (J-1) et hebdomadaires (7 jours)
- [x] Permettre la gestion complète via WhatsApp (abonnement, thèmes, fréquence)
- [ ] Tester le flux complet (gratuit + payant)


## Phase 13: Déploiement Railway
- [x] Créer un dépôt GitHub
- [x] Pousser le code sur GitHub
- [x] Créer un projet Railway
- [x] Connecter le dépôt GitHub à Railway
- [x] Configurer les variables d'environnement
- [x] Générer le domaine public Railway
- [ ] Configurer les webhooks Twilio et Stripe
- [ ] Tester le déploiement

## Phase 14: Configuration des Webhooks Production
- [ ] Configurer le webhook Twilio WhatsApp avec l'URL Railway
- [ ] Configurer le webhook Stripe avec l'URL Railway
- [ ] Tester l'envoi de messages WhatsApp
- [ ] Tester le flux de paiement Stripe
- [ ] Valider le flux complet (gratuit + payant)

## Phase 15: Correction Erreur __dirname Railway
- [x] Identifier tous les fichiers utilisant __dirname ou import.meta.dirname
- [x] Corriger pour compatibilité ES modules (utiliser process.cwd())
- [x] Tester localement
- [ ] Pousser sur GitHub et redéployer Railway
- [ ] Valider que le serveur démarre correctement

## Phase 16: Résolution Définitive Erreur __dirname Railway
- [x] Analyser le code compilé dist/index.js ligne 1162
- [x] Identifier tous les usages de __dirname dans le code source
- [x] Corriger tous les usages problématiques (vite.config.ts et vitest.config.ts)
- [x] Rebuild et tester localement
- [ ] Pousser sur GitHub et redéployer Railway
- [ ] Valider que le serveur démarre correctement

## Phase 17: Résolution Complète Railway + Suppression Dépendances Manus
- [x] Vérifier pourquoi Railway utilise l'ancien dist/ (pas de buildCommand)
- [x] Analyser la configuration de build Railway (railway.json, package.json)
- [x] Identifier toutes les dépendances Manus non nécessaires (OAuth gardé pour compatibilité)
- [x] Corriger railway.json avec buildCommand explicite
- [x] Corriger vite.config.ts et vitest.config.ts (fileURLToPath)
- [x] Tester le build complet localement (succès)
- [ ] Déployer sur Railway et valider

## Phase 18: Configuration et Test Twilio WhatsApp
- [x] Identifier le type de numéro Twilio (Sandbox)
- [x] Créer un guide de configuration pour le Sandbox
- [x] Corriger le serveur pour écouter sur 0.0.0.0 en production
- [x] Ajouter endpoint /health pour Railway health check
- [x] Configurer healthcheckPath dans railway.json
- [ ] Configurer le webhook Twilio avec l'URL Railway
- [ ] Tester l'envoi et la réception de messages WhatsApp

## Phase 19: Configuration Base de Données Railway
- [x] Configurer la connexion avec l'URL publique Railway
- [x] Corriger le schéma (url varchar 768 au lieu de 2048)
- [x] Exécuter les migrations Drizzle
- [x] Vérifier que les 5 tables sont créées (users, subscriptions, userPreferences, syntheses, articles)
- [ ] Tester la connexion depuis l'application Railway

## Phase 20: Résolution Erreur 502 Webhook Twilio
- [x] Analyser les logs Railway (erreur 502 connection refused)
- [x] Examiner le code du webhook Twilio
- [x] Identifier le bug: double envoi (TwiML + sendWhatsAppMessage)
- [x] Corriger: supprimer sendWhatsAppMessage, utiliser uniquement TwiML
- [x] Build réussi localement
- [ ] Déployer et valider que l'assistant répond sur WhatsApp

## Phase 21: Debug Crash Webhook Railway
- [x] Ajouter des logs détaillés dans twilioWebhook.ts
- [x] Ajouter try/catch robuste avec status 200 pour éviter retries Twilio
- [x] Build réussi
- [x] Déployer et analyser les logs Railway
- [x] Identifier le problème: Railway ne peut pas router vers le serveur (variable PORT manquante)

## Phase 22: Configuration PORT Railway
- [x] Identifier que Railway expose port 3000 mais serveur écoute sur 8080
- [x] Corriger server/_core/index.ts pour forcer PORT en production
- [x] Build réussi
- [ ] Déployer sur Railway
- [ ] Tester /health endpoint pour confirmer accès
- [ ] Tester webhook WhatsApp et valider réponse

## Phase 23: Corrections Logique Assistant WhatsApp
- [x] Identifier le modèle IA utilisé (Gemini 2.5 Flash)
- [x] Identifier les problèmes NewsAPI.ai
- [x] Remplacer Gemini par OpenAI GPT-4
- [x] Corriger NewsAPI.ai (supprimer filtre langue fra)
- [x] Ajouter logs détaillés NewsAPI pour debug
- [ ] Déployer et tester sur Railway

## Phase 24: Amélioration Prompts et Enregistrement Auto Utilisateurs
- [x] Améliorer le prompt d'analyse d'intention (ajouter subscribe_premium, meilleurs exemples)
- [x] Améliorer le prompt de génération de réponse (présenter fonctionnalités, supprimer mention compte)
- [x] Permettre des réponses détaillées pour les actualités (pas de limite stricte)
- [x] Filtrer uniquement les sources françaises dans NewsAPI.ai
- [x] Implémenter l'enregistrement automatique des utilisateurs à la première interaction
- [ ] Tester le flux complet (nouveau numéro → utilisateur gratuit → paiement → utilisateur payant)

## Phase 27: Correction Envoi Message WhatsApp
- [x] Analyser le webhook Twilio : réponse générée mais pas envoyée
- [x] Vérifier le code d'envoi de message dans twilioWebhook.ts
- [x] Corriger le problème : supprimer whatsappPhoneNumber du schéma Drizzle
- [x] Corriger synthesisScheduler.ts et stripe.ts pour utiliser openId
- [x] Tester et pousser sur GitHub

## Phase 28: Remplacement NewsAPI.ai par Google News RSS
- [x] Analyser le service newsApi.ts actuel
- [x] Créer le service googleNewsRss.ts
- [x] Remplacer les appels NewsAPI.ai dans whatsappAiHandler.ts
- [x] Remplacer les appels NewsAPI.ai dans openaiSynthesis.ts
- [x] Remplacer les appels NewsAPI.ai dans synthesisGenerator.ts
- [x] Remplacer les appels NewsAPI.ai dans services.test.ts
- [x] Tester le build
- [ ] Créer un checkpoint et pousser sur GitHub

## Phase 29: Recherche par Mots-Clés dans handleQuestion()
- [x] Analyser handleQuestion() actuel (utilise toujours "Actualités")
- [x] Créer une fonction extractKeywordsFromQuestion() avec OpenAI
- [x] Modifier handleQuestion() pour extraire les mots-clés de la question
- [x] Utiliser les mots-clés extraits pour chercher des articles pertinents
- [x] Tester avec différentes questions (sport, tech, politique, etc.)
- [ ] Créer un checkpoint et pousser sur GitHub

## Phase 30: Amélioration Prompt OpenAI pour Réponses Ciblées
- [x] Analyser le prompt OpenAI actuel dans openaiSynthesis.ts
- [x] Modifier le prompt pour répondre directement à la question posée
- [x] Ajouter un paramètre userQuestion à generateSynthesisWithOpenAI()
- [x] Passer la question depuis handleQuestion()
- [x] Tester le build
- [ ] Créer un checkpoint et pousser sur GitHub
