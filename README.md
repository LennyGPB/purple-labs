# PurpleLabs

PWA personnelle : TODO, notes et abonnements. Next.js 16 (App Router), Tailwind CSS 4, Prisma 7 + Neon, Serwist.

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | URL Neon **poolée** (hôte `-pooler`), utilisée par l'app |
| `DIRECT_URL` | URL Neon **directe**, utilisée par `prisma migrate` |
| `APP_PASSWORD` | Mot de passe unique de l'app |
| `SESSION_SECRET` | Secret de signature des cookies de session (32+ caractères) |
| `NEXT_PUBLIC_APP_TIMEZONE` | Optionnel, fuseau des dates (défaut `Europe/Paris`) |

Voir `.env.example`.

## Setup local

```bash
cp .env.example .env        # puis remplir les valeurs
npm install                 # lance aussi `prisma generate` (postinstall)
npx prisma migrate deploy   # applique les migrations existantes
npm run dev
```

Modifier le schéma : éditer `prisma/schema.prisma`, puis `npm run db:migrate -- --name <nom>`.

## Déploiement Vercel

Renseigner les variables ci-dessus dans le projet Vercel. Le script `build` applique les migrations
(`prisma migrate deploy`) puis lance `next build --webpack` (requis par `@serwist/next`).
Le service worker n'est généré qu'en production.
