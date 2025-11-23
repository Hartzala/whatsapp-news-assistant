# WhatsApp News Assistant

Un assistant IA qui envoie des synthèses d'actualités personnalisées via WhatsApp. Les utilisateurs choisissent leurs thèmes d'intérêt et reçoivent des synthèses quotidiennes ou hebdomadaires à 3,99€/mois.

## 🚀 Fonctionnalités

- **Synthèses Personnalisées** : Chaque utilisateur choisit ses thèmes d'actualités
- **Fréquence Flexible** : Synthèses quotidiennes ou hebdomadaires
- **Génération IA** : Utilise GPT pour créer des synthèses concises et pertinentes
- **Paiement Stripe** : Gestion des abonnements à 3,99€/mois
- **API WhatsApp** : Intégration complète avec WhatsApp Cloud API
- **Base de Données** : Stockage des préférences utilisateur et historique

## 📋 Stack Technique

- **Backend** : Node.js + Express + tRPC
- **Frontend** : React 19 + Tailwind CSS 4
- **Base de Données** : MySQL/MariaDB + Drizzle ORM
- **APIs Externes** :
  - WhatsApp Cloud API (Meta)
  - NewsAPI.ai (articles d'actualités)
  - Stripe (paiements)
  - OpenAI/LLM (génération de synthèses)

## 🛠️ Installation Locale

### Prérequis

- Node.js 18+
- pnpm
- MySQL 8.0+

### Étapes

1. **Cloner le projet**
   ```bash
   git clone <votre-repo>
   cd whatsapp_news_assistant
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos credentials
   ```

4. **Initialiser la base de données**
   ```bash
   pnpm db:push
   ```

5. **Démarrer le serveur de développement**
   ```bash
   pnpm dev
   ```

   L'application sera disponible à `http://localhost:3000`

## 🔧 Configuration

### Variables d'Environnement Requises

```env
# Base de données
DATABASE_URL=mysql://user:password@localhost:3306/whatsapp_news

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=944049325447961
WHATSAPP_ACCESS_TOKEN=your_token_here
WHATSAPP_VERIFY_TOKEN=0487f908dbc43c084e9aa440195ff611020061b17180aacb18ca26d0b75dfbd1

# NewsAPI
NEWS_API_KEY=your_newsapi_key

# Stripe (optionnel)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
JWT_SECRET=your_jwt_secret
```

### Configuration WhatsApp

Consultez [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md) pour les instructions détaillées de configuration des webhooks.

## 📱 Utilisation

### Commandes WhatsApp

Les utilisateurs peuvent utiliser les commandes suivantes :

| Commande | Description |
|----------|-------------|
| `menu` | Affiche le menu principal |
| `thèmes` | Configure les thèmes d'actualités |
| `fréquence` | Choisit quotidien ou hebdomadaire |
| `abonnement` | Gère l'abonnement |
| `payer` | Lien vers le paiement |
| `arrêter` | Annule l'abonnement |

### Exemple de Flux Utilisateur

1. L'utilisateur envoie "menu"
2. Le bot répond avec les options disponibles
3. L'utilisateur tape "thèmes"
4. Le bot demande les thèmes (ex: "technologie, finance, sport")
5. L'utilisateur tape "fréquence"
6. Le bot demande quotidien ou hebdomadaire
7. L'utilisateur tape "payer"
8. Le bot envoie un lien Stripe
9. Après le paiement, l'utilisateur reçoit ses synthèses

## 🧪 Tests

Exécuter les tests :

```bash
pnpm test
```

Exécuter les tests en mode watch :

```bash
pnpm test:watch
```

## 📊 Architecture

### Structure des Fichiers

```
whatsapp_news_assistant/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Pages de l'application
│   │   ├── components/    # Composants réutilisables
│   │   └── lib/           # Utilitaires
│   └── public/            # Assets statiques
├── server/                # Backend Express
│   ├── routers/           # Routeurs tRPC
│   ├── services/          # Services métier
│   ├── webhooks/          # Gestionnaires de webhooks
│   ├── jobs/              # Tâches planifiées
│   ├── db.ts              # Fonctions de base de données
│   └── _core/             # Configuration core
├── drizzle/               # Migrations et schéma
├── WHATSAPP_SETUP.md      # Guide de configuration WhatsApp
├── DEPLOYMENT.md          # Guide de déploiement
└── README.md              # Ce fichier
```

### Flux de Données

```
WhatsApp Message
    ↓
Webhook Handler (/api/webhooks/whatsapp)
    ↓
Process User Message
    ↓
Generate Response / Update Preferences
    ↓
Send WhatsApp Message
    ↓
Log to Database
```

### Scheduler de Synthèses

```
Every Hour
    ↓
Check Active Users with Preferences
    ↓
Determine if Synthesis Should Be Sent
    ↓
Fetch Articles from NewsAPI
    ↓
Generate Synthesis with LLM
    ↓
Send via WhatsApp
    ↓
Save to Database
```

## 🚀 Déploiement

Consultez [DEPLOYMENT.md](./DEPLOYMENT.md) pour les instructions de déploiement sur :
- Heroku
- Railway
- DigitalOcean
- AWS
- Autres plateformes

## 📈 Modèle Économique

- **Prix** : 3,99€/mois par utilisateur
- **Coûts Variables** :
  - Stripe : ~0,42€ par utilisateur
  - WhatsApp : 0,10€-0,74€ selon la fréquence
  - NewsAPI : ~0,02€ par synthèse
  - IA (GPT) : ~0,05€ par synthèse
- **Seuil de Rentabilité** : ~439 utilisateurs

Pour l'analyse financière complète, consultez le business plan.

## 🔐 Sécurité

- ✅ Vérification des webhooks WhatsApp
- ✅ Authentification OAuth intégrée
- ✅ Tokens d'accès sécurisés
- ✅ Variables d'environnement protégées
- ✅ Validation des entrées utilisateur

## 🐛 Dépannage

### Le webhook ne se vérifie pas

```bash
# Vérifier le Verify Token
echo $WHATSAPP_VERIFY_TOKEN

# Vérifier l'URL de callback
curl https://your-domain.com/api/webhooks/whatsapp
```

### Les messages ne sont pas envoyés

```bash
# Vérifier les logs
pnpm dev

# Vérifier les credentials
echo $WHATSAPP_PHONE_NUMBER_ID
echo $WHATSAPP_ACCESS_TOKEN
```

### La base de données ne se connecte pas

```bash
# Vérifier la chaîne de connexion
echo $DATABASE_URL

# Tester la connexion
pnpm db:push
```

## 📚 Documentation Supplémentaire

- [WhatsApp Setup Guide](./WHATSAPP_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Business Plan](../business_plan_3.99.md)
- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [NewsAPI Docs](https://newsapi.ai/docs)

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Consultez le fichier `LICENSE` pour plus de détails.

## 💬 Support

Pour toute question ou problème, veuillez :

1. Consulter la documentation
2. Vérifier les logs du serveur
3. Ouvrir une issue sur GitHub
4. Contacter le support

## 🎯 Roadmap

- [ ] Interface utilisateur pour gérer les préférences
- [ ] Historique des synthèses
- [ ] Intégration avec d'autres services (Telegram, Email)
- [ ] Analyse de sentiment
- [ ] Recommandations personnalisées
- [ ] Support multilingue
- [ ] Application mobile native

---

**Créé avec ❤️ par Manus AI**
