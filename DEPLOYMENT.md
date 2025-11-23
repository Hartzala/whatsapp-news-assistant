# Guide de Déploiement - WhatsApp News Assistant

Ce guide explique comment déployer votre assistant d'actualités WhatsApp en production.

## Prérequis

- Node.js 18+ et pnpm
- Une base de données MySQL/MariaDB
- Comptes et credentials pour :
  - WhatsApp Business API (Meta)
  - NewsAPI.ai
  - Stripe (optionnel, pour les paiements)

## Variables d'Environnement Requises

Créez un fichier `.env` avec les variables suivantes :

```env
# Base de données
DATABASE_URL=mysql://user:password@host:port/database

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=944049325447961
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_VERIFY_TOKEN=0487f908dbc43c084e9aa440195ff611020061b17180aacb18ca26d0b75dfbd1

# NewsAPI
NEWS_API_KEY=your_newsapi_key_here

# Stripe (optionnel)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OAuth (fourni par Manus)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
JWT_SECRET=your_jwt_secret

# Application
NODE_ENV=production
PORT=3000
```

## Installation et Configuration

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd whatsapp_news_assistant
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configurer la base de données

```bash
# Générer et appliquer les migrations
pnpm db:push
```

### 4. Construire l'application

```bash
pnpm build
```

### 5. Démarrer le serveur

```bash
pnpm start
```

## Déploiement sur Heroku

### 1. Créer une application Heroku

```bash
heroku create your-app-name
```

### 2. Ajouter une base de données

```bash
heroku addons:create cleardb:ignite
```

### 3. Configurer les variables d'environnement

```bash
heroku config:set WHATSAPP_PHONE_NUMBER_ID=944049325447961
heroku config:set WHATSAPP_ACCESS_TOKEN=your_token
heroku config:set WHATSAPP_VERIFY_TOKEN=your_verify_token
heroku config:set NEWS_API_KEY=your_newsapi_key
# ... autres variables
```

### 4. Déployer

```bash
git push heroku main
```

### 5. Vérifier les logs

```bash
heroku logs --tail
```

## Déploiement sur Railway

### 1. Connecter votre repository

Allez sur [railway.app](https://railway.app) et connectez votre GitHub.

### 2. Configurer les variables d'environnement

Dans le dashboard Railway, ajoutez toutes les variables d'environnement requises.

### 3. Déployer

Railway détectera automatiquement le projet Node.js et le déploiera.

## Déploiement sur DigitalOcean

### 1. Créer un Droplet

```bash
# Créer un Droplet Ubuntu 22.04 avec Node.js
```

### 2. Installer les dépendances

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm

# Installer MySQL
sudo apt-get install -y mysql-server
```

### 3. Cloner et configurer

```bash
git clone <votre-repo>
cd whatsapp_news_assistant
pnpm install
```

### 4. Configurer les variables d'environnement

```bash
nano .env
# Ajouter toutes les variables requises
```

### 5. Démarrer avec PM2

```bash
npm install -g pm2
pnpm build
pm2 start "pnpm start" --name "whatsapp-news"
pm2 save
```

### 6. Configurer Nginx comme reverse proxy

```bash
sudo apt-get install -y nginx

# Créer la configuration
sudo nano /etc/nginx/sites-available/default
```

Ajouter :

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Puis :

```bash
sudo systemctl restart nginx
```

## Configuration des Webhooks en Production

Une fois déployé, configurez les webhooks WhatsApp :

1. Allez à **WhatsApp > Configuration > Webhooks**
2. Entrez l'URL de callback : `https://your-domain.com/api/webhooks/whatsapp`
3. Entrez le Verify Token
4. Cliquez sur **Vérifier et enregistrer**

## Monitoring et Logs

### Vérifier les logs

```bash
# Heroku
heroku logs --tail

# DigitalOcean avec PM2
pm2 logs whatsapp-news

# SSH et vérifier les logs
tail -f /var/log/syslog
```

### Configurer les alertes

Utilisez des services comme :
- **Sentry** pour les erreurs
- **LogRocket** pour les sessions utilisateur
- **Datadog** pour le monitoring complet

## Mise à Jour en Production

### Déployer une nouvelle version

```bash
# Heroku
git push heroku main

# DigitalOcean
git pull origin main
pnpm install
pnpm build
pm2 restart whatsapp-news
```

## Dépannage

### Le serveur ne démarre pas

```bash
# Vérifier les logs
pnpm start

# Vérifier les variables d'environnement
echo $DATABASE_URL
```

### Les webhooks ne fonctionnent pas

- Vérifiez que l'URL est accessible : `curl https://your-domain.com/api/webhooks/whatsapp`
- Vérifiez le Verify Token dans Meta Business Platform
- Vérifiez les logs du serveur

### Les messages ne sont pas envoyés

- Vérifiez que le Access Token est valide
- Vérifiez que le Phone Number ID est correct
- Vérifiez les logs de WhatsApp dans Meta Business Platform

## Support

Pour plus d'informations, consultez :
- [Documentation WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Guide de déploiement Node.js](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
