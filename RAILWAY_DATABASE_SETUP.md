# Configuration de la Base de Données Railway

La base de données MySQL est créée automatiquement par Railway, mais les **tables doivent être créées manuellement** en exécutant les migrations Drizzle.

## Étape 1 : Récupérer l'URL de la Base de Données

1. Allez sur votre projet Railway
2. Cliquez sur le service **MySQL**
3. Allez dans l'onglet **Variables**
4. Copiez la valeur de `DATABASE_URL`

L'URL ressemble à :
```
mysql://root:password@host.railway.app:3306/railway
```

## Étape 2 : Créer les Tables avec Drizzle

### Option A : Depuis votre machine locale

1. **Créer un fichier `.env` local** (si pas déjà fait) :
```bash
DATABASE_URL="mysql://root:password@host.railway.app:3306/railway"
```

2. **Exécuter les migrations** :
```bash
pnpm db:push
```

Cette commande va :
- Générer les migrations SQL depuis `drizzle/schema.ts`
- Les appliquer à la base de données Railway

### Option B : Depuis Railway CLI

Si vous avez installé Railway CLI :

```bash
railway run pnpm db:push
```

## Étape 3 : Vérifier que les Tables sont Créées

Vous pouvez vérifier dans Railway :
1. Cliquez sur le service MySQL
2. Allez dans l'onglet **Data**
3. Vous devriez voir les tables : `users`, `subscriptions`, `userPreferences`, `syntheses`, `articles`

## Tables Créées

Les migrations vont créer ces 5 tables :

1. **users** : Utilisateurs de l'application
2. **subscriptions** : Abonnements Stripe (Premium)
3. **userPreferences** : Préférences utilisateur (thèmes, fréquence)
4. **syntheses** : Synthèses d'actualités générées
5. **articles** : Articles d'actualités récupérés

## Dépannage

### Erreur de connexion

Si vous obtenez une erreur de connexion, vérifiez :
- L'URL `DATABASE_URL` est correcte
- Le port 3306 n'est pas bloqué par votre firewall
- Vous avez bien copié l'URL complète avec le mot de passe

### Tables déjà existantes

Si les tables existent déjà, `pnpm db:push` va les mettre à jour si le schéma a changé.

## Commandes Utiles

```bash
# Générer les migrations sans les appliquer
pnpm drizzle-kit generate

# Appliquer les migrations
pnpm drizzle-kit migrate

# Générer ET appliquer (recommandé)
pnpm db:push
```
