# Guide de Déploiement sur Railway

Ce guide explique comment déployer le projet WhatsApp News Assistant sur Railway.

## Prérequis

1. **Compte Railway** : Créez un compte sur [railway.app](https://railway.app)
2. **Repository GitHub** : Code source poussé sur GitHub
3. **Comptes externes** :
   - Compte Twilio (WhatsApp)
   - Clé API OpenAI
   - Clé API NewsAPI.ai
   - Compte Stripe

## Étape 1 : Créer un Nouveau Projet Railway

1. Connectez-vous à [railway.app](https://railway.app)
2. Cliquez sur **New Project**
3. Sélectionnez **Deploy from GitHub repo**
4. Autorisez Railway à accéder à votre GitHub
5. Sélectionnez le repository `whatsapp_news_assistant`

## Étape 2 : Configurer les Variables d'Environnement

Dans le Dashboard Railway, allez à **Variables** et ajoutez :

### Base de Données
```
DATABASE_URL=<fourni automatiquement par Railway si vous ajoutez MySQL>
```

### Authentification Manus
```
JWT_SECRET=<votre_jwt_secret>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=<votre_app_id>
OWNER_OPEN_ID=<votre_open_id>
OWNER_NAME=<votre_nom>
```

### Twilio WhatsApp
```
TWILIO_ACCOUNT_SID=<votre_account_sid>
TWILIO_AUTH_TOKEN=<votre_auth_token>
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### OpenAI
```
OPENAI_API_KEY=<votre_openai_api_key>
```

### NewsAPI.ai
```
NEWS_API_KEY=<votre_newsapi_key>
```

### Stripe
```
STRIPE_SECRET_KEY=<votre_stripe_secret_key>
STRIPE_PUBLISHABLE_KEY=<votre_stripe_publishable_key>
STRIPE_WEBHOOK_SECRET=<votre_stripe_webhook_secret>
```

### Application
```
NODE_ENV=production
VITE_APP_TITLE=NewsBot
VITE_APP_LOGO=/logo.png
```

## Étape 3 : Ajouter une Base de Données MySQL

1. Dans votre projet Railway, cliquez sur **New**
2. Sélectionnez **Database** → **MySQL**
3. Railway créera automatiquement la base de données
4. La variable `DATABASE_URL` sera automatiquement ajoutée

## Étape 4 : Déployer

1. Railway détecte automatiquement le `package.json`
2. Le déploiement démarre automatiquement
3. Attendez que le build se termine (environ 3-5 minutes)
4. Une URL publique sera générée (ex: `https://whatsapp-news-assistant-production.up.railway.app`)

## Étape 5 : Configurer les Webhooks

### Twilio WhatsApp Webhook

1. Allez à [console.twilio.com](https://console.twilio.com)
2. Sélectionnez votre WhatsApp Sender
3. Dans **Sandbox Settings** ou **Messaging Configuration** :
   - **When a message comes in** : `https://votre-url-railway.up.railway.app/api/webhooks/twilio/whatsapp`
   - **Method** : POST
4. Cliquez sur **Save**

### Stripe Webhook

1. Allez à [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur **Add endpoint**
3. **Endpoint URL** : `https://votre-url-railway.up.railway.app/api/webhooks/stripe`
4. **Events to send** :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Cliquez sur **Add endpoint**
6. Copiez le **Signing secret** et ajoutez-le à Railway comme `STRIPE_WEBHOOK_SECRET`

## Étape 6 : Vérifier le Déploiement

### Vérifier les Logs

```bash
# Dans Railway Dashboard, cliquez sur "View Logs"
```

### Tester le Webhook Twilio

```bash
curl -X GET "https://votre-url-railway.up.railway.app/api/webhooks/twilio/whatsapp"
```

Résultat attendu :
```json
{
  "status": "ok",
  "message": "Twilio WhatsApp webhook is ready"
}
```

### Tester WhatsApp

Envoyez un message WhatsApp à votre numéro Twilio et vérifiez que vous recevez une réponse.

## Étape 7 : Configurer le Domaine Personnalisé (Optionnel)

1. Dans Railway Dashboard, allez à **Settings** → **Domains**
2. Cliquez sur **Generate Domain** ou **Custom Domain**
3. Suivez les instructions pour configurer votre DNS

## Commandes Utiles

### Voir les Logs en Temps Réel

Dans Railway Dashboard :
- Cliquez sur **Deployments**
- Sélectionnez le déploiement actif
- Cliquez sur **View Logs**

### Redémarrer le Service

Dans Railway Dashboard :
- Cliquez sur **Settings**
- Cliquez sur **Restart**

### Rollback à une Version Précédente

Dans Railway Dashboard :
- Cliquez sur **Deployments**
- Sélectionnez un déploiement précédent
- Cliquez sur **Redeploy**

## Dépannage

### Le Build Échoue

**Problème** : Erreur lors du build TypeScript

**Solution** :
1. Vérifiez les logs de build
2. Assurez-vous que toutes les dépendances sont dans `package.json`
3. Vérifiez que le script `build` fonctionne localement

### Le Service Ne Démarre Pas

**Problème** : Le service crash au démarrage

**Solution** :
1. Vérifiez que toutes les variables d'environnement sont définies
2. Vérifiez les logs pour identifier l'erreur
3. Assurez-vous que `DATABASE_URL` est correcte

### Les Webhooks Ne Fonctionnent Pas

**Problème** : Aucun message reçu sur WhatsApp

**Solution** :
1. Vérifiez que l'URL du webhook est correcte
2. Testez l'endpoint avec `curl`
3. Vérifiez les logs Railway pour voir si les requêtes arrivent
4. Vérifiez que `TWILIO_ACCOUNT_SID` et `TWILIO_AUTH_TOKEN` sont corrects

## Coûts Estimés

| Service | Coût |
|---------|------|
| **Railway** | $5/mois (Hobby plan) + usage |
| **MySQL Database** | Inclus dans Railway |
| **Bandwidth** | $0.10/GB au-delà de 100GB/mois |

**Total estimé** : ~$5-10/mois selon l'usage

## Support

Pour toute question :
- Documentation Railway : [docs.railway.app](https://docs.railway.app)
- Documentation Twilio : [twilio.com/docs](https://www.twilio.com/docs)
- Support Railway : [help.railway.app](https://help.railway.app)
