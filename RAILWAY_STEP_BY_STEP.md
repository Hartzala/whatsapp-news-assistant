# Guide Pas à Pas : Configuration Railway

## Étape 1 : Accéder à Railway

1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec votre compte GitHub
3. Vous devriez voir votre projet **whatsapp-news-assistant**
4. Cliquez dessus pour l'ouvrir

---

## Étape 2 : Ajouter une Base de Données MySQL

1. Dans votre projet, cliquez sur **"+ New"** (en haut à droite)
2. Sélectionnez **"Database"**
3. Choisissez **"Add MySQL"**
4. Railway créera automatiquement la base de données
5. **Important** : Railway génère automatiquement la variable `DATABASE_URL`

---

## Étape 3 : Configurer les Variables d'Environnement

1. Cliquez sur votre service **whatsapp-news-assistant** (pas la base de données)
2. Allez dans l'onglet **"Variables"**
3. Cliquez sur **"+ New Variable"** ou **"Raw Editor"** (plus rapide)

### Option A : Raw Editor (Recommandé)

Cliquez sur **"Raw Editor"** et collez toutes les variables d'un coup :

```bash
# Base de données (Railway génère automatiquement DATABASE_URL, vérifiez qu'elle existe)

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=votre_account_sid_twilio
TWILIO_AUTH_TOKEN=votre_auth_token_twilio
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# OpenAI
OPENAI_API_KEY=votre_openai_api_key

# NewsAPI.ai
NEWS_API_KEY=votre_newsapi_key

# Stripe
STRIPE_SECRET_KEY=votre_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=votre_stripe_publishable_key
STRIPE_PRICE_ID=votre_stripe_price_id
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# Manus OAuth (CRITIQUES)
JWT_SECRET=votre_jwt_secret
VITE_APP_ID=votre_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=votre_owner_open_id
OWNER_NAME=votre_nom

# Frontend
VITE_APP_TITLE=NewsBot
VITE_APP_LOGO=/logo.svg
VITE_FRONTEND_FORGE_API_KEY=votre_frontend_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=votre_backend_api_key

# Analytics (Optionnel)
VITE_ANALYTICS_ENDPOINT=votre_analytics_endpoint
VITE_ANALYTICS_WEBSITE_ID=votre_website_id
```

### Option B : Une par Une

Si vous préférez ajouter une par une :
1. Cliquez sur **"+ New Variable"**
2. Entrez le **nom** (ex: `TWILIO_ACCOUNT_SID`)
3. Entrez la **valeur** (ex: `ACxxxxxxxxxxxxxxxxx`)
4. Cliquez sur **"Add"**
5. Répétez pour chaque variable

---

## Étape 4 : Où Trouver Vos Valeurs

### Twilio
- Console : https://console.twilio.com
- **Account SID** et **Auth Token** : Dashboard principal
- **WhatsApp Number** : `whatsapp:+14155238886` (numéro de test Twilio)

### OpenAI
- https://platform.openai.com/api-keys
- Créez une nouvelle clé API

### NewsAPI.ai
- https://newsapi.ai
- Dashboard → API Key

### Stripe
- https://dashboard.stripe.com
- **Secret Key** et **Publishable Key** : Developers → API keys
- **Price ID** : Products → Votre produit Premium → Price ID
- **Webhook Secret** : On le configurera après (laissez vide pour l'instant)

### Manus OAuth
Ces valeurs sont **déjà dans vos secrets Manus**. Vous pouvez les trouver dans :
- Le dashboard Manus
- Ou me demander de les extraire pour vous

---

## Étape 5 : Sauvegarder et Redéployer

1. Après avoir ajouté toutes les variables, cliquez sur **"Deploy"** ou attendez
2. Railway redéploiera automatiquement votre application
3. Surveillez les **logs** pour vérifier qu'il n'y a plus d'erreurs

---

## Étape 6 : Récupérer l'URL Railway

1. Dans votre service, allez dans **"Settings"**
2. Descendez jusqu'à **"Networking"**
3. Cliquez sur **"Generate Domain"**
4. Railway vous donnera une URL comme :
   ```
   https://whatsapp-news-assistant-production.up.railway.app
   ```
5. **Copiez cette URL** - vous en aurez besoin pour configurer les webhooks

---

## Étape 7 : Vérifier le Déploiement

1. Allez dans l'onglet **"Deployments"**
2. Cliquez sur le déploiement le plus récent
3. Vérifiez les **logs** :
   - ✅ Vous devriez voir : `Server running on http://0.0.0.0:3000/`
   - ❌ S'il y a encore des erreurs, envoyez-moi les logs

---

## Prochaines Étapes

Une fois que Railway fonctionne sans erreur :
1. **Configurer les webhooks Twilio** avec l'URL Railway
2. **Configurer les webhooks Stripe** avec l'URL Railway
3. **Tester le flux complet** en envoyant un message WhatsApp

---

## Besoin d'Aide ?

Si vous êtes bloqué à une étape, dites-moi où et je vous aiderai !
