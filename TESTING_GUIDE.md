# Guide de Test Complet - WhatsApp News Assistant

Ce guide explique comment tester votre assistant WhatsApp à tous les niveaux.

## 📋 Table des Matières

1. [Tests Unitaires](#tests-unitaires)
2. [Tests des Webhooks](#tests-des-webhooks)
3. [Tests WhatsApp Manuels](#tests-whatsapp-manuels)
4. [Tests d'Intégration](#tests-dintégration)
5. [Tests de Performance](#tests-de-performance)

---

## 🧪 Tests Unitaires

### Exécuter les tests

```bash
# Exécuter tous les tests une fois
pnpm test

# Exécuter les tests en mode watch (re-run automatique)
pnpm test:watch

# Exécuter un fichier de test spécifique
pnpm test server/__tests__/services.test.ts

# Exécuter avec couverture
pnpm test:coverage
```

### Résultats attendus

```
✓ server/__tests__/services.test.ts (13 tests)
  ✓ NewsAPI Service
    ✓ formatArticlesForSynthesis
      ✓ should format articles correctly
      ✓ should return empty message for empty articles
      ✓ should respect max length
  ✓ Synthesis Generator Service
    ✓ formatSynthesisForWhatsApp
      ✓ should return content as-is if under limit
      ✓ should truncate content if over limit
      ✓ should respect WhatsApp 4096 character limit
  ✓ Database Functions
    ✓ should have proper type definitions
  ✓ WhatsApp Message Handler
    ✓ should recognize menu command
    ✓ should recognize topics command
    ✓ should parse comma-separated topics
  ✓ Webhook Verification
    ✓ should have correct verify token format
    ✓ should validate phone number format
  ✓ Configuration
    ✓ should have required environment variables defined

Test Files  1 passed (1)
Tests  13 passed (13)
```

---

## 🔗 Tests des Webhooks

### 1. Vérifier que le serveur démarre correctement

```bash
pnpm dev
```

Vous devriez voir :

```
[OAuth] Initialized with baseURL: https://api.manus.im
[WhatsApp] Webhook routes registered
Server running on http://localhost:3000/
```

### 2. Tester le webhook de vérification (GET)

```bash
# Test avec les bons paramètres
curl -X GET "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=0487f908dbc43c084e9aa440195ff611020061b17180aacb18ca26d0b75dfbd1&hub.challenge=test_challenge_string"

# Résultat attendu : test_challenge_string
```

### 3. Tester le webhook avec mauvais token

```bash
# Test avec mauvais token
curl -X GET "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=test_challenge_string"

# Résultat attendu : 403 Forbidden
```

### 4. Tester la réception de messages (POST)

```bash
# Simuler un message WhatsApp entrant
curl -X POST "http://localhost:3000/api/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [
      {
        "id": "123456789",
        "changes": [
          {
            "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                "display_phone_number": "33612345678",
                "phone_number_id": "944049325447961"
              },
              "contacts": [
                {
                  "profile": {
                    "name": "Test User"
                  },
                  "wa_id": "33612345678"
                }
              ],
              "messages": [
                {
                  "from": "33612345678",
                  "id": "wamid.test123",
                  "timestamp": "1234567890",
                  "type": "text",
                  "text": {
                    "body": "menu"
                  }
                }
              ]
            }
          }
        ]
      }
    ]
  }'

# Résultat attendu : {"received": true}
# Vérifiez les logs pour : [WhatsApp] Received message from 33612345678
```

---

## 📱 Tests WhatsApp Manuels

### Prérequis

1. **Installer ngrok** pour exposer votre serveur local :
   ```bash
   # Télécharger depuis https://ngrok.com/download
   # Ou installer via Homebrew (Mac)
   brew install ngrok
   ```

2. **Démarrer ngrok** :
   ```bash
   ngrok http 3000
   ```

   Vous verrez :
   ```
   Forwarding     https://xxxx-xx-xxx-xxx-xx.ngrok.io -> http://localhost:3000
   ```

### Configuration du Webhook dans Meta

1. Allez à [developers.facebook.com](https://developers.facebook.com)
2. Sélectionnez votre app
3. Allez à **WhatsApp > Configuration > Webhooks**
4. Cliquez sur **Modifier**
5. Entrez :
   - **URL de callback** : `https://votre-ngrok-url.ngrok.io/api/webhooks/whatsapp`
   - **Verify Token** : `0487f908dbc43c084e9aa440195ff611020061b17180aacb18ca26d0b75dfbd1`
6. Cliquez sur **Vérifier et enregistrer**

### Tester les Commandes

Ouvrez WhatsApp sur votre téléphone et envoyez des messages à votre numéro de test :

#### Test 1 : Menu

**Envoyez** : `menu`

**Réponse attendue** :
```
Je n'ai pas compris votre message.

Tapez *menu* pour voir les commandes disponibles.
```

#### Test 2 : Thèmes

**Envoyez** : `thèmes`

**Réponse attendue** :
```
Quels thèmes vous intéressent ?

Entrez-les séparés par des virgules.

Exemples: technologie, finance, sport, politique, santé, environnement, divertissement
```

#### Test 3 : Configuration des Thèmes

**Envoyez** : `technologie, finance, sport`

**Réponse attendue** :
```
✅ Thèmes configurés: technologie, finance, sport

Maintenant, choisissez votre fréquence:
- Tapez *quotidien* pour une synthèse chaque jour
- Tapez *hebdomadaire* pour une synthèse chaque semaine
```

#### Test 4 : Fréquence

**Envoyez** : `quotidien`

**Réponse attendue** :
```
Choisissez votre fréquence:

1️⃣ *Quotidien* - Synthèse chaque jour à 8h
7️⃣ *Hebdomadaire* - Synthèse chaque lundi à 8h

Répondez avec: quotidien ou hebdomadaire
```

#### Test 5 : Abonnement

**Envoyez** : `abonnement`

**Réponse attendue** :
```
💳 *Gestion de l'abonnement*

Notre service coûte 3,99€/mois pour accéder à des synthèses d'actualités personnalisées.

Tapez *payer* pour vous abonner ou *annuler* pour arrêter votre abonnement.
```

#### Test 6 : Paiement

**Envoyez** : `payer`

**Réponse attendue** :
```
Pour vous abonner, veuillez cliquer sur le lien suivant:

[Lien de paiement - À configurer avec Stripe]

Une fois le paiement effectué, vous recevrez vos synthèses d'actualités personnalisées.
```

---

## 🔄 Tests d'Intégration

### 1. Tester la Connexion à la Base de Données

```bash
# Vérifier que les migrations sont appliquées
pnpm db:push

# Vous devriez voir :
# ✓ Migrations applied successfully
```

### 2. Tester la Génération de Synthèses

Créez un fichier de test :

```bash
cat > test_synthesis.mjs << 'EOF'
import { generateSynthesis } from './server/services/synthesisGenerator.ts';

const result = await generateSynthesis(['technologie', 'finance']);
console.log('Synthesis Result:', result);
EOF

node test_synthesis.mjs
```

### 3. Tester l'Envoi de Messages WhatsApp

```bash
# Via curl (remplacez les valeurs)
curl -X POST "https://graph.instagram.com/v18.0/944049325447961/messages" \
  -H "Authorization: Bearer EAAO9ya3i954..." \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "33612345678",
    "type": "text",
    "text": {
      "body": "Test message"
    }
  }'
```

---

## ⚡ Tests de Performance

### 1. Tester la Latence du Webhook

```bash
# Mesurer le temps de réponse
time curl -X POST "http://localhost:3000/api/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{"object":"whatsapp_business_account","entry":[{"changes":[{"value":{"messages":[{"from":"33612345678","type":"text","text":{"body":"test"}}]}}]}]}'

# Résultat attendu : < 100ms
```

### 2. Tester la Charge

```bash
# Installer Apache Bench (si nécessaire)
# Mac: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Tester avec 100 requêtes, 10 concurrentes
ab -n 100 -c 10 http://localhost:3000/api/webhooks/whatsapp

# Résultat attendu : Requests per second > 50
```

### 3. Vérifier les Logs

```bash
# Voir les logs en temps réel
pnpm dev

# Vous devriez voir des messages comme :
# [WhatsApp] Webhook routes registered
# [WhatsApp] Received message from 33612345678
# [WhatsApp] Message 33612345678 status: sent
```

---

## 🐛 Dépannage des Tests

### Le webhook ne se vérifie pas

```bash
# Vérifier le Verify Token
echo $WHATSAPP_VERIFY_TOKEN

# Vérifier que ngrok est actif
ngrok http 3000

# Vérifier les logs
pnpm dev
```

### Les messages ne sont pas reçus

```bash
# Vérifier que le numéro est dans la liste de test
# Allez à WhatsApp > API Setup > Send and receive messages

# Vérifier les logs de Meta Business Platform
# https://developers.facebook.com/docs/whatsapp/webhooks/

# Vérifier les logs du serveur
tail -f /var/log/app.log
```

### Les tests unitaires échouent

```bash
# Exécuter les tests avec plus de détails
pnpm test -- --reporter=verbose

# Exécuter un test spécifique
pnpm test -- --grep "should format articles"

# Vérifier les dépendances
pnpm install
```

---

## ✅ Checklist de Test Complet

Avant de déployer en production, assurez-vous que :

- [ ] Tous les tests unitaires passent (`pnpm test`)
- [ ] Le webhook de vérification fonctionne (GET request)
- [ ] Les messages entrants sont reçus (POST request)
- [ ] Les commandes WhatsApp fonctionnent (menu, thèmes, etc.)
- [ ] Les synthèses sont générées correctement
- [ ] Les messages sont envoyés à WhatsApp
- [ ] La base de données est connectée
- [ ] Les logs ne montrent pas d'erreurs
- [ ] La latence est acceptable (< 100ms)
- [ ] La documentation est à jour

---

## 📚 Ressources Utiles

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Webhooks Reference](https://developers.facebook.com/docs/whatsapp/webhooks/)
- [Testing Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/)
- [Postman Collection](https://www.postman.com/meta/whatsapp-business-platform/)

---

**Vous êtes prêt à tester ! Commencez par les tests unitaires, puis les webhooks, et enfin les tests manuels WhatsApp.** 🚀
