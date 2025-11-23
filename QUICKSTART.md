# Guide de Démarrage Rapide

Suivez ces étapes pour mettre en place et tester votre assistant WhatsApp News.

## 1️⃣ Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Node.js 18+ installé
- ✅ pnpm installé (`npm install -g pnpm`)
- ✅ MySQL 8.0+ en cours d'exécution
- ✅ Credentials WhatsApp (Phone Number ID, Access Token, Verify Token)
- ✅ Clé API NewsAPI.ai

## 2️⃣ Installation

### Cloner le projet

```bash
git clone <votre-repo>
cd whatsapp_news_assistant
```

### Installer les dépendances

```bash
pnpm install
```

### Configurer la base de données

1. Créer une base de données MySQL :
   ```sql
   CREATE DATABASE whatsapp_news CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Mettre à jour `DATABASE_URL` dans les secrets du projet

3. Appliquer les migrations :
   ```bash
   pnpm db:push
   ```

## 3️⃣ Configuration

### Configurer les Secrets

Allez à **Settings > Secrets** dans le Management UI et configurez :

| Variable | Valeur |
|----------|--------|
| `WHATSAPP_PHONE_NUMBER_ID` | 944049325447961 |
| `WHATSAPP_ACCESS_TOKEN` | Votre token |
| `WHATSAPP_VERIFY_TOKEN` | 0487f908dbc43c084e9aa440195ff611020061b17180aacb18ca26d0b75dfbd1 |
| `NEWS_API_KEY` | Votre clé NewsAPI |
| `DATABASE_URL` | `mysql://user:pass@localhost:3306/whatsapp_news` |

## 4️⃣ Démarrer en Développement

```bash
pnpm dev
```

L'application sera disponible à `http://localhost:3000`

### Exposer l'URL pour les webhooks

Pour tester les webhooks en développement, utilisez ngrok :

```bash
# Dans un autre terminal
ngrok http 3000
```

Cela vous donnera une URL comme : `https://xxxx-xx-xxx-xxx-xx.ngrok.io`

## 5️⃣ Configurer les Webhooks WhatsApp

1. Allez à [Meta Business Platform](https://developers.facebook.com)
2. Sélectionnez votre app
3. Allez à **WhatsApp > Configuration > Webhooks**
4. Configurez :
   - **URL de callback** : `https://votre-ngrok-url.ngrok.io/api/webhooks/whatsapp`
   - **Verify Token** : `0487f908dbc43c084e9aa440195ff611020061b17180aacb18ca26d0b75dfbd1`
5. Cliquez sur **Vérifier et enregistrer**

## 6️⃣ Tester

### Envoyer un message de test

1. Ouvrez WhatsApp sur votre téléphone
2. Envoyez un message à votre numéro de test WhatsApp
3. Tapez : `menu`
4. Vous devriez recevoir le menu principal

### Commandes de test

```
menu          → Affiche le menu
thèmes        → Configure les thèmes
fréquence     → Choisit la fréquence
abonnement    → Gère l'abonnement
```

### Vérifier les logs

```bash
# Les logs s'affichent dans le terminal
pnpm dev

# Vous devriez voir :
# [WhatsApp] Webhook routes registered
# [WhatsApp] Received message from 33612345678
```

## 7️⃣ Exécuter les Tests

```bash
pnpm test
```

Tous les tests devraient passer :

```
✓ server/__tests__/services.test.ts (13 tests)
Test Files  1 passed (1)
Tests  13 passed (13)
```

## 8️⃣ Construire pour la Production

```bash
pnpm build
```

Cela créera une version optimisée prête pour le déploiement.

## 9️⃣ Déployer

Consultez [DEPLOYMENT.md](./DEPLOYMENT.md) pour les instructions de déploiement sur :
- Heroku
- Railway
- DigitalOcean
- AWS

## 🔟 Dépannage

### Le webhook ne se vérifie pas

```bash
# Vérifier que ngrok est en cours d'exécution
ngrok http 3000

# Vérifier le Verify Token
echo $WHATSAPP_VERIFY_TOKEN

# Vérifier les logs
pnpm dev
```

### Les messages ne sont pas reçus

- Assurez-vous que le numéro de téléphone est dans la liste des destinataires de test
- Vérifiez que les événements `messages` sont activés dans les webhooks
- Vérifiez les logs de Meta Business Platform

### La base de données ne se connecte pas

```bash
# Vérifier la chaîne de connexion
echo $DATABASE_URL

# Tester la connexion MySQL
mysql -u user -p -h localhost whatsapp_news
```

## 📚 Prochaines Étapes

1. **Configurer Stripe** (optionnel) : Consultez [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Créer une interface utilisateur** : Modifiez `client/src/pages/Home.tsx`
3. **Ajouter des templates de messages** : Consultez la documentation WhatsApp
4. **Configurer le scheduler** : Consultez `server/jobs/synthesisScheduler.ts`
5. **Déployer en production** : Consultez [DEPLOYMENT.md](./DEPLOYMENT.md)

## 💡 Conseils

- Utilisez le **Preview** dans le Management UI pour tester l'interface
- Consultez les **logs** du serveur pour déboguer
- Testez avec des **numéros de test** avant de déployer
- Sauvegardez régulièrement des **checkpoints** avant les changements importants

## 🆘 Besoin d'Aide ?

- Consultez [README.md](./README.md) pour la documentation complète
- Consultez [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md) pour la configuration WhatsApp
- Consultez [DEPLOYMENT.md](./DEPLOYMENT.md) pour le déploiement
- Vérifiez les [logs du serveur](http://localhost:3000)

---

**Vous êtes prêt ! Commencez par envoyer "menu" à votre numéro de test WhatsApp.** 🚀
