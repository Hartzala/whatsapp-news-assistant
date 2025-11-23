# Configuration WhatsApp Cloud API

Ce guide explique comment configurer les webhooks WhatsApp pour votre assistant d'actualités.

## Credentials Configurés

Vous avez fourni les informations suivantes :

```
WHATSAPP_PHONE_NUMBER_ID = 944049325447961
WHATSAPP_ACCESS_TOKEN = [Configuré dans les secrets]
WHATSAPP_VERIFY_TOKEN = 0487f908dbc43c084e9aa440195ff611020061b17180aacb18ca26d0b75dfbd1
```

## Configuration des Webhooks dans Meta Business Platform

### Étape 1 : Accéder aux paramètres des webhooks

1. Allez à [developers.facebook.com](https://developers.facebook.com)
2. Sélectionnez votre application
3. Dans le menu de gauche, allez à **WhatsApp > Configuration**
4. Descendez jusqu'à la section **Webhooks**

### Étape 2 : Configurer l'URL de callback

Vous devez fournir l'URL où Meta enverra les webhooks. Cela dépend de votre environnement :

**En développement (avec ngrok) :**
```
https://votre-ngrok-url.ngrok.io/api/webhooks/whatsapp
```

**En production :**
```
https://votre-domaine.com/api/webhooks/whatsapp
```

### Étape 3 : Configurer le Verify Token

1. Dans la section Webhooks, cliquez sur **Modifier**
2. Entrez le **Verify Token** :
   ```
   0487f908dbc43c084e9aa440195ff611020061b17180aacb18ca26d0b75dfbd1
   ```
3. Cliquez sur **Vérifier et enregistrer**

### Étape 4 : Souscrire aux événements

Assurez-vous que les événements suivants sont activés :

- ✅ `messages` - Pour recevoir les messages entrants
- ✅ `message_status` - Pour les mises à jour de statut (livré, lu, etc.)
- ✅ `message_template_status_update` - Pour les mises à jour de modèles

## Tester les Webhooks en Développement

### Utiliser ngrok pour exposer votre serveur local

```bash
# Installer ngrok (si ce n'est pas déjà fait)
# https://ngrok.com/download

# Exposer le port 3000
ngrok http 3000
```

Cela vous donnera une URL comme : `https://xxxx-xx-xxx-xxx-xx.ngrok.io`

### Configurer l'URL de callback dans Meta

1. Allez à **WhatsApp > Configuration > Webhooks**
2. Entrez l'URL : `https://votre-ngrok-url.ngrok.io/api/webhooks/whatsapp`
3. Entrez le Verify Token
4. Cliquez sur **Vérifier et enregistrer**

### Tester l'envoi de messages

Une fois configuré, vous pouvez tester en envoyant un message à votre numéro de test WhatsApp.

Le serveur répondra automatiquement avec un menu.

## Commandes Disponibles

Les utilisateurs peuvent utiliser les commandes suivantes :

- **menu** ou **aide** - Affiche le menu principal
- **thèmes** - Configure les thèmes d'actualités
- **fréquence** - Choisit la fréquence (quotidien/hebdomadaire)
- **abonnement** - Gère l'abonnement
- **payer** - Lien vers le paiement Stripe
- **arrêter** - Annule l'abonnement

## Dépannage

### Le webhook ne se vérifie pas

- Vérifiez que le **Verify Token** est correct
- Assurez-vous que l'URL de callback est accessible
- Vérifiez les logs du serveur pour les erreurs

### Les messages ne sont pas reçus

- Vérifiez que les événements `messages` sont activés
- Assurez-vous que le numéro de téléphone est dans la liste des destinataires de test
- Vérifiez les logs de Meta Business Platform

### Les messages ne sont pas envoyés

- Vérifiez que le **Access Token** est valide
- Assurez-vous que le **Phone Number ID** est correct
- Vérifiez que le numéro destinataire est au format international (ex: 33612345678)

## Ressources Utiles

- [Documentation WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Référence des webhooks](https://developers.facebook.com/docs/whatsapp/webhooks/)
- [Guide de démarrage](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/)
