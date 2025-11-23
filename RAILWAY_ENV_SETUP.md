# Configuration des Variables d'Environnement Railway

## 📋 Variables à Configurer

Allez dans **Settings → Variables** de votre projet Railway et ajoutez les variables suivantes :

### 1. Base de Données (Automatique)
Railway génère automatiquement `DATABASE_URL` quand vous ajoutez MySQL. Vérifiez qu'elle existe.

```
DATABASE_URL=mysql://user:password@host:port/database
```

### 2. Twilio WhatsApp
```
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Où trouver :**
- Console Twilio : https://console.twilio.com
- Account SID et Auth Token : Dashboard principal
- WhatsApp Number : Messaging → Try it out → Send a WhatsApp message

### 3. OpenAI
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

**Où trouver :**
- https://platform.openai.com/api-keys
- Créez une nouvelle clé API

### 4. NewsAPI.ai
```
NEWS_API_KEY=votre_newsapi_key
```

**Où trouver :**
- https://newsapi.ai
- Dashboard → API Key

### 5. Stripe
```
STRIPE_SECRET_KEY=sk_live_xxxxx (ou sk_test_xxxxx pour les tests)
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx (ou pk_test_xxxxx)
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Où trouver :**
- https://dashboard.stripe.com
- Developers → API keys (pour Secret et Publishable)
- Products → Votre produit Premium → Price ID
- Webhooks → Add endpoint → Webhook secret (après configuration)

### 6. Manus OAuth (Déjà Configurées)
Ces variables sont déjà dans vos secrets Manus. Copiez-les :

```
JWT_SECRET=votre_jwt_secret
VITE_APP_ID=votre_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=votre_owner_open_id
OWNER_NAME=votre_nom
```

### 7. Frontend
```
VITE_APP_TITLE=NewsBot
VITE_APP_LOGO=/logo.svg
VITE_FRONTEND_FORGE_API_KEY=votre_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

### 8. Manus Built-in APIs
```
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=votre_backend_key
```

### 9. Analytics (Optionnel)
```
VITE_ANALYTICS_ENDPOINT=votre_analytics_endpoint
VITE_ANALYTICS_WEBSITE_ID=votre_website_id
```

---

## 🚀 Après Configuration

1. **Déployez** : Railway redémarrera automatiquement après l'ajout des variables
2. **Récupérez l'URL** : Railway vous donnera une URL comme `https://whatsapp-news-assistant-production.up.railway.app`
3. **Configurez les webhooks** avec cette URL (voir étape suivante)

---

## ⚠️ Important

- Utilisez les clés **TEST** de Stripe pour commencer (`sk_test_`, `pk_test_`)
- Ne commitez JAMAIS ces valeurs dans Git
- Railway chiffre automatiquement toutes les variables d'environnement
