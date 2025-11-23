# Guide de Test Local - Sans ngrok

Ce guide vous montre comment tester votre assistant WhatsApp localement sans avoir besoin de ngrok ou de déployer en production.

## 🚀 Tester les Webhooks Localement

### Option 1 : Tester avec cURL (Recommandé pour déboguer)

#### 1. Vérifier le webhook (GET)

```bash
curl -X GET "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=0487f908dbc43c084e9aa440195ff611020061b17180aacb18ca26d0b75dfbd1&hub.challenge=test_challenge"
```

**Réponse attendue :**
```
test_challenge
```

#### 2. Envoyer un message de test (POST)

```bash
curl -X POST "http://localhost:3000/api/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "33612345678",
            "id": "wamid.test123",
            "timestamp": "'$(date +%s)'",
            "type": "text",
            "text": {
              "body": "Bonjour, je veux la technologie et la finance"
            }
          }]
        }
      }]
    }]
  }'
```

**Réponse attendue :**
```json
{"received": true}
```

### Option 2 : Tester via le Dashboard tRPC

Le projet inclut une interface tRPC que vous pouvez utiliser pour tester les procédures directement.

1. Allez à `http://localhost:3000/api/trpc`
2. Vous pouvez appeler les procédures tRPC directement

### Option 3 : Tests Unitaires

Exécutez les tests pour valider le comportement :

```bash
pnpm test
```

Cela exécute 43 tests qui couvrent :
- Gestion du contexte utilisateur
- Analyse d'intentions IA
- Gestion des messages WhatsApp
- Procédures du tableau de bord

## 📰 Exemple de Réponse NewsAPI.ai

Voici un exemple typique de ce que retourne l'API NewsAPI.ai :

```json
{
  "articles": [
    {
      "uri": "29566344",
      "lang": "en",
      "isDuplicate": false,
      "date": "2025-11-23",
      "time": "08:30:00",
      "dateTime": "2025-11-23T08:30:00Z",
      "dateTimePub": "2025-11-23T08:30:00Z",
      "dataType": "news",
      "sim": 0,
      "url": "https://example.com/article-about-ai",
      "title": "OpenAI Releases New AI Model with Advanced Capabilities",
      "body": "OpenAI has announced a breakthrough in artificial intelligence...",
      "source": {
        "uri": "techcrunch.com",
        "title": "TechCrunch"
      },
      "authors": [
        {
          "uri": "author-123",
          "name": "John Smith"
        }
      ],
      "image": "https://example.com/image.jpg",
      "sentiment": 0.8,
      "wgt": 1.0,
      "relevance": 0.95
    },
    {
      "uri": "29566345",
      "lang": "en",
      "isDuplicate": false,
      "date": "2025-11-23",
      "time": "07:15:00",
      "dateTime": "2025-11-23T07:15:00Z",
      "dateTimePub": "2025-11-23T07:15:00Z",
      "dataType": "news",
      "sim": 0,
      "url": "https://example.com/article-about-stocks",
      "title": "Stock Market Reaches Record High Amid Tech Rally",
      "body": "The stock market surged today as technology stocks led the gains...",
      "source": {
        "uri": "bloomberg.com",
        "title": "Bloomberg"
      },
      "authors": [
        {
          "uri": "author-456",
          "name": "Jane Doe"
        }
      ],
      "image": "https://example.com/image2.jpg",
      "sentiment": 0.75,
      "wgt": 0.95,
      "relevance": 0.92
    }
  ],
  "totalResults": 1250,
  "page": 1,
  "pageSize": 2
}
```

### Champs Importants :

| Champ | Description |
|-------|-------------|
| `uri` | Identifiant unique de l'article |
| `title` | Titre de l'article |
| `body` | Contenu/résumé de l'article |
| `url` | Lien vers l'article complet |
| `source.title` | Nom du média source |
| `date` | Date de publication |
| `image` | URL de l'image de couverture |
| `sentiment` | Score de sentiment (-1 à 1) |
| `relevance` | Score de pertinence (0 à 1) |

## 🤖 Exemple de Synthèse Générée

Quand un utilisateur demande une synthèse, voici ce que l'IA génère :

**Input :** Articles sur la technologie et la finance

**Output (Synthèse IA) :**

```
📰 **Synthèse Technologie & Finance - 23 Nov 2025**

🚀 **Top Stories**

1️⃣ **OpenAI Releases New AI Model**
   - Source: TechCrunch
   - OpenAI a annoncé une percée majeure en intelligence artificielle avec un nouveau modèle offrant des capacités avancées.
   - 📊 Sentiment: Positif

2️⃣ **Stock Market Reaches Record High**
   - Source: Bloomberg
   - Le marché boursier a augmenté aujourd'hui, les actions technologiques menant les gains.
   - 📊 Sentiment: Positif

3️⃣ [Autres articles...]

💡 **Résumé du jour**
Les marchés technologiques et financiers connaissent une dynamique positive, portée par les innovations en IA et la confiance des investisseurs.

---
Prochaine synthèse : Lundi 26 Nov à 8h00
```

## 🧪 Tester l'Analyse d'Intentions IA

L'IA comprend les messages en langage naturel. Exemples :

| Message Utilisateur | Intention Détectée | Données Extraites |
|---|---|---|
| "Je veux la technologie et la finance" | `set_topics` | `["Technologie", "Finance"]` |
| "Envoie-moi des news quotidiennement" | `set_frequency` | `frequency: "daily"` |
| "Tech, sport, politique" | `set_topics` | `["Technologie", "Sport", "Politique"]` |
| "Hebdo c'est mieux" | `set_frequency` | `frequency: "weekly"` |
| "Aide-moi" | `help` | - |
| "Bonjour" | `greeting` | - |

## 🔧 Tester la Génération de Synthèses

Pour tester la génération de synthèses localement :

```bash
# 1. Créer un fichier test
cat > test_synthesis.js << 'EOF'
import { generateSynthesis } from './server/services/synthesisGenerator.js';

const articles = [
  {
    title: "OpenAI Releases New AI Model",
    body: "OpenAI announced a breakthrough in AI...",
    url: "https://example.com/article1",
    source: "TechCrunch",
    date: "2025-11-23"
  },
  {
    title: "Stock Market Reaches Record High",
    body: "The stock market surged today...",
    url: "https://example.com/article2",
    source: "Bloomberg",
    date: "2025-11-23"
  }
];

const synthesis = await generateSynthesis(articles, ["Technologie", "Finance"]);
console.log(synthesis);
EOF

# 2. Exécuter le test
node test_synthesis.js
```

## ✅ Checklist de Test Local

- [ ] Webhook GET verification fonctionne
- [ ] Webhook POST reçoit les messages
- [ ] Analyse d'intentions fonctionne
- [ ] Génération de réponses naturelles fonctionne
- [ ] Tous les 43 tests passent (`pnpm test`)
- [ ] Dashboard accessible à `http://localhost:3000/dashboard`
- [ ] Préférences peuvent être sauvegardées

## 🚀 Quand Passer en Production

Une fois que vous avez validé localement :

1. **Déployer le backend** (Heroku, Railway, DigitalOcean, etc.)
2. **Configurer le webhook WhatsApp** avec l'URL de production
3. **Tester avec votre numéro de test WhatsApp**
4. **Configurer Stripe** pour les paiements réels
5. **Lancer le scheduler** pour les synthèses quotidiennes/hebdomadaires

## 📝 Notes

- Le stockage du contexte utilisateur est actuellement en mémoire. Pour la production, migrez vers une base de données.
- Les synthèses générées utilisent l'IA Manus intégrée (pas besoin de clé API externe).
- NewsAPI.ai nécessite une clé API payante pour la production. Vous pouvez utiliser une API gratuite comme NewsAPI.org en développement.
