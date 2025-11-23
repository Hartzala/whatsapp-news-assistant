# Configuration des Webhooks Production

## Prérequis

Vous devez avoir :
- ✅ Votre URL Railway (ex: `https://whatsapp-news-assistant-production.up.railway.app`)
- ✅ Un compte Twilio avec un numéro WhatsApp
- ✅ Un compte Stripe avec le produit Premium créé

---

## 1. Configuration du Webhook Twilio WhatsApp

### Étape 1 : Accéder à la Console Twilio

1. Allez sur [console.twilio.com](https://console.twilio.com)
2. Connectez-vous avec votre compte Twilio

### Étape 2 : Configurer le Webhook WhatsApp

1. Dans le menu de gauche, allez à **Messaging → Try it out → Send a WhatsApp message**
2. Ou allez directement à **Messaging → Settings → WhatsApp Sandbox Settings**
3. Vous verrez une section **"When a message comes in"**

### Étape 3 : Entrer l'URL du Webhook

Dans le champ **"When a message comes in"**, entrez :

```
https://VOTRE-URL-RAILWAY.up.railway.app/api/webhooks/twilio/whatsapp
```

**Exemple** :
```
https://whatsapp-news-assistant-production.up.railway.app/api/webhooks/twilio/whatsapp
```

### Étape 4 : Configurer la Méthode HTTP

- Sélectionnez **HTTP POST** dans le menu déroulant

### Étape 5 : Sauvegarder

- Cliquez sur **Save**

### Étape 6 : Tester

1. Envoyez un message WhatsApp à votre numéro Twilio
2. Vous devriez recevoir une réponse de l'assistant IA

---

## 2. Configuration du Webhook Stripe

### Étape 1 : Accéder au Dashboard Stripe

1. Allez sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Connectez-vous avec votre compte Stripe

### Étape 2 : Aller dans les Webhooks

1. Dans le menu de gauche, cliquez sur **Developers**
2. Cliquez sur **Webhooks**
3. Cliquez sur **"+ Add endpoint"**

### Étape 3 : Entrer l'URL du Webhook

Dans le champ **"Endpoint URL"**, entrez :

```
https://VOTRE-URL-RAILWAY.up.railway.app/api/webhooks/stripe
```

**Exemple** :
```
https://whatsapp-news-assistant-production.up.railway.app/api/webhooks/stripe
```

### Étape 4 : Sélectionner les Événements

Cliquez sur **"Select events"** et cochez les événements suivants :

**Subscription Events** :
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

**Checkout Events** :
- ✅ `checkout.session.completed`

**Invoice Events** :
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### Étape 5 : Ajouter le Webhook

- Cliquez sur **"Add endpoint"**

### Étape 6 : Récupérer le Webhook Secret

1. Une fois le webhook créé, cliquez dessus
2. Vous verrez une section **"Signing secret"**
3. Cliquez sur **"Reveal"** pour voir le secret
4. **Copiez ce secret** (commence par `whsec_...`)

### Étape 7 : Ajouter le Secret à Railway

1. Allez sur **Railway → Votre projet → Variables**
2. Ajoutez ou modifiez la variable :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Railway redéploiera automatiquement

---

## 3. Vérification

### Vérifier Twilio

1. Envoyez un message WhatsApp à votre numéro Twilio
2. Vous devriez recevoir une réponse de l'assistant IA
3. Vérifiez les logs Railway pour voir les requêtes entrantes

### Vérifier Stripe

1. Allez dans **Stripe Dashboard → Webhooks**
2. Cliquez sur votre webhook
3. Vous verrez les **"Recent events"**
4. Testez un paiement pour voir si les événements sont reçus

---

## 4. Dépannage

### Twilio : Pas de réponse

- Vérifiez que l'URL Railway est correcte
- Vérifiez les logs Railway pour voir si la requête arrive
- Vérifiez que `TWILIO_ACCOUNT_SID` et `TWILIO_AUTH_TOKEN` sont corrects

### Stripe : Événements non reçus

- Vérifiez que l'URL Railway est correcte
- Vérifiez que `STRIPE_WEBHOOK_SECRET` est configuré dans Railway
- Testez le webhook dans Stripe Dashboard → Webhooks → "Send test webhook"

---

## 5. URLs Complètes

Voici les URLs complètes à configurer :

### Twilio WhatsApp
```
https://VOTRE-URL-RAILWAY.up.railway.app/api/webhooks/twilio/whatsapp
```

### Stripe
```
https://VOTRE-URL-RAILWAY.up.railway.app/api/webhooks/stripe
```

---

## Prochaines Étapes

Une fois les webhooks configurés :
1. Testez l'envoi de messages WhatsApp
2. Testez un paiement Stripe
3. Vérifiez que l'abonnement est activé dans la base de données
4. Testez la réception des synthèses automatiques

Besoin d'aide ? Consultez les logs Railway pour diagnostiquer les problèmes !
