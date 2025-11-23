# Guide de Configuration Stripe

Ce guide vous accompagne pas à pas pour configurer Stripe et intégrer les paiements d'abonnement à 3,99€/mois.

## Étape 1 : Créer un Compte Stripe

1. Allez sur [stripe.com](https://stripe.com)
2. Cliquez sur **Sign up** (ou **Create account**)
3. Remplissez le formulaire :
   - Email
   - Nom complet
   - Pays (France)
   - Mot de passe
4. Vérifiez votre email
5. Complétez les informations de votre entreprise

## Étape 2 : Activer le Mode Test

Par défaut, Stripe vous place en **mode test**. C'est parfait pour commencer !

Dans le Dashboard Stripe :
- En haut à gauche, vous verrez un toggle **Test mode**
- Assurez-vous qu'il est activé (orange/bleu)

## Étape 3 : Obtenir les Clés API

### Clés de Test

1. Dans le Dashboard Stripe, cliquez sur **Developers** (en haut à droite)
2. Cliquez sur **API keys**
3. Vous verrez deux clés :
   - **Publishable key** (commence par `pk_test_`)
   - **Secret key** (commence par `sk_test_`, cliquez sur **Reveal test key** pour la voir)

**Copiez ces deux clés** et conservez-les en sécurité.

```
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Clés de Production (Plus tard)

Une fois que vous êtes prêt pour la production :
1. Désactivez le **Test mode**
2. Retournez dans **Developers > API keys**
3. Copiez les clés de production (`pk_live_` et `sk_live_`)

## Étape 4 : Créer le Produit Premium

### Via le Dashboard

1. Dans le Dashboard Stripe, allez à **Products**
2. Cliquez sur **Add product**
3. Remplissez les informations :
   - **Name** : `Premium NewsBot`
   - **Description** : `Accès illimité aux synthèses d'actualités personnalisées sur WhatsApp`
   - **Pricing model** : `Standard pricing`
   - **Price** : `3.99`
   - **Currency** : `EUR`
   - **Billing period** : `Monthly`
4. Cliquez sur **Save product**

### Récupérer le Price ID

Après avoir créé le produit :
1. Cliquez sur le produit que vous venez de créer
2. Vous verrez une section **Pricing**
3. Copiez le **Price ID** (commence par `price_`)

```
STRIPE_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Étape 5 : Configurer les Webhooks

Les webhooks permettent à Stripe de notifier votre application des événements (paiement réussi, abonnement annulé, etc.).

### Créer un Endpoint Webhook

1. Dans le Dashboard Stripe, allez à **Developers > Webhooks**
2. Cliquez sur **Add endpoint**
3. **Endpoint URL** :
   - **En développement** : Utilisez ngrok (voir ci-dessous)
   - **En production** : `https://votre-domaine.com/api/webhooks/stripe`
4. **Events to send** : Sélectionnez ces événements
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Cliquez sur **Add endpoint**

### Récupérer le Webhook Secret

Après avoir créé l'endpoint :
1. Cliquez sur l'endpoint que vous venez de créer
2. Vous verrez **Signing secret**
3. Cliquez sur **Reveal** et copiez la valeur (commence par `whsec_`)

```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Étape 6 : Tester avec ngrok (Développement Local)

Pour tester les webhooks en local, vous devez exposer votre serveur local avec ngrok.

### Installer ngrok

```bash
# Mac
brew install ngrok

# Linux
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip
unzip ngrok-stable-linux-amd64.zip
sudo mv ngrok /usr/local/bin
```

### Démarrer ngrok

```bash
ngrok http 3000
```

Vous verrez :
```
Forwarding     https://xxxx-xx-xxx-xxx-xx.ngrok.io -> http://localhost:3000
```

### Configurer le Webhook avec ngrok

1. Copiez l'URL ngrok (ex: `https://xxxx-xx-xxx-xxx-xx.ngrok.io`)
2. Dans Stripe Dashboard > Developers > Webhooks
3. Modifiez votre endpoint
4. **Endpoint URL** : `https://xxxx-xx-xxx-xxx-xx.ngrok.io/api/webhooks/stripe`
5. Cliquez sur **Update endpoint**

## Étape 7 : Configurer le Customer Portal

Le Customer Portal permet aux clients de gérer leur abonnement (annuler, mettre à jour le moyen de paiement, etc.).

1. Dans le Dashboard Stripe, allez à **Settings > Billing > Customer portal**
2. Activez le Customer Portal
3. Configurez les options :
   - **Allow customers to** :
     - ✅ Update payment methods
     - ✅ Cancel subscriptions
     - ✅ Switch plans (optionnel)
   - **Business information** :
     - Nom de votre entreprise
     - Email de support
     - Lien vers vos conditions d'utilisation
     - Lien vers votre politique de confidentialité
4. Cliquez sur **Save**

## Étape 8 : Résumé des Variables d'Environnement

Vous devriez maintenant avoir toutes ces valeurs :

```bash
# Clés API Stripe (Test)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Price ID du produit Premium
STRIPE_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Étape 9 : Tester le Flux de Paiement

### Cartes de Test Stripe

Stripe fournit des cartes de test pour simuler différents scénarios :

| Numéro de carte | Scénario |
|-----------------|----------|
| `4242 4242 4242 4242` | Paiement réussi |
| `4000 0000 0000 0002` | Carte refusée |
| `4000 0000 0000 9995` | Fonds insuffisants |

**Informations supplémentaires** (pour toutes les cartes de test) :
- **Date d'expiration** : N'importe quelle date future (ex: 12/25)
- **CVC** : N'importe quel code à 3 chiffres (ex: 123)
- **Code postal** : N'importe quel code postal valide

### Tester un Paiement

1. Démarrez votre serveur local : `pnpm dev`
2. Démarrez ngrok : `ngrok http 3000`
3. Ouvrez votre application : `http://localhost:3000`
4. Cliquez sur **Commencer Gratuitement** ou **S'abonner**
5. Utilisez la carte de test `4242 4242 4242 4242`
6. Complétez le paiement
7. Vérifiez dans le Dashboard Stripe > **Payments** que le paiement est bien enregistré

## Étape 10 : Vérifier les Webhooks

### Via le Dashboard

1. Allez à **Developers > Webhooks**
2. Cliquez sur votre endpoint
3. Vous verrez l'historique des événements envoyés
4. Vérifiez que les événements sont bien reçus (statut 200)

### Via les Logs

Dans votre terminal, vous devriez voir :
```
[Stripe Webhook] Received event: checkout.session.completed
[Stripe Webhook] Subscription created for user: user@example.com
```

## Étape 11 : Passer en Production

Quand vous êtes prêt :

1. **Activez votre compte Stripe** :
   - Complétez les informations de votre entreprise
   - Ajoutez vos informations bancaires
   - Vérifiez votre identité

2. **Basculez en mode Production** :
   - Désactivez le **Test mode**
   - Récupérez les clés de production (`pk_live_` et `sk_live_`)
   - Mettez à jour vos variables d'environnement

3. **Mettez à jour le Webhook** :
   - Créez un nouvel endpoint avec votre URL de production
   - Récupérez le nouveau **Webhook Secret**

4. **Testez en Production** :
   - Faites un vrai paiement de test avec votre propre carte
   - Vérifiez que tout fonctionne
   - Annulez l'abonnement de test

## Dépannage

### Le Webhook Ne Reçoit Pas les Événements

**Problème** : Aucun événement n'arrive sur votre endpoint

**Solutions** :
1. Vérifiez que ngrok est bien démarré
2. Vérifiez que l'URL du webhook est correcte
3. Testez l'endpoint manuellement :
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/stripe \
     -H "Content-Type: application/json" \
     -d '{"type": "test"}'
   ```
4. Vérifiez les logs de votre serveur

### La Signature du Webhook Est Invalide

**Problème** : Erreur "Webhook signature verification failed"

**Solutions** :
1. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
2. Assurez-vous d'utiliser le secret du bon endpoint (test vs production)
3. Vérifiez que vous utilisez `req.rawBody` et non `req.body` pour la vérification

### Le Paiement Est Refusé

**Problème** : La carte de test est refusée

**Solutions** :
1. Vérifiez que vous êtes en **Test mode**
2. Utilisez la carte `4242 4242 4242 4242`
3. Vérifiez que la date d'expiration est dans le futur

## Ressources

- [Documentation Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/build-subscriptions)
- [Cartes de Test Stripe](https://stripe.com/docs/testing)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)
- [Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Dashboard Stripe](https://dashboard.stripe.com)

## Support

Pour toute question :
- Support Stripe : [support.stripe.com](https://support.stripe.com)
- Documentation : [stripe.com/docs](https://stripe.com/docs)
