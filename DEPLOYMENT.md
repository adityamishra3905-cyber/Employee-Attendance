# Vercel Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com)
- Git repository pushed to GitHub/GitLab/Bitbucket
- Database service (see options below)

## Step 1: Choose Your Database

### Option 1: Vercel Postgres (Recommended - Easiest)
1. Go to your Vercel project dashboard
2. Click "Settings" → "Storage"
3. Click "Create Database" → Select "Postgres"
4. Vercel will automatically create `POSTGRES_URL` environment variable
5. Copy the connection string and add to environment variables

### Option 2: Supabase (Free PostgreSQL)
1. Go to https://supabase.com and create an account
2. Create a new project
3. Copy the connection string from Project Settings
4. Add to Vercel environment: `DATABASE_URL`

### Option 3: PlanetScale (Free MySQL)
1. Go to https://planetscale.com and create an account
2. Create a new database
3. Get the connection string
4. Add to Vercel environment: `DATABASE_URL`

### Option 4: Migrate from SQLite to PostgreSQL (For existing data)
```bash
# If you have existing data in SQLite, consider:
# - Exporting data
# - Setting up PostgreSQL
# - Using Prisma's migration tools to preserve data
```

## Step 2: Switch Database Provider

Edit `prisma/schema.prisma`:

**For PostgreSQL (Vercel Postgres / Supabase):**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**For MySQL (PlanetScale):**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

## Step 3: Deploy to Vercel

### Via Vercel CLI (Recommended)
```bash
npm install -g vercel
vercel login
vercel deploy
```

### Via GitHub Integration (Easiest)
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Select "Next.js" framework (auto-detected)
5. Add environment variables:
   - Set `DATABASE_URL` to your database connection string
6. Click "Deploy"

## Step 4: Configure Environment Variables in Vercel

1. Go to your Vercel project → Settings → Environment Variables
2. Add `DATABASE_URL` with your database connection string
3. Keep it for all environments (Production, Preview, Development)
4. Redeploy if already deployed

## Step 5: Run Database Migrations

Vercel will automatically run migrations during build if you've updated package.json scripts:
```json
"build": "prisma generate && prisma migrate deploy --skip-generate && next build"
```

If migrations don't run automatically:
1. Connect via terminal after deployment
2. Or run migrations manually before pushing

## Step 6: Verify Deployment

1. Check Vercel build logs for any errors
2. Visit your deployed URL
3. Test the application:
   - Add an employee
   - Mark attendance
   - Check reports

## Troubleshooting

### Build Fails: "Prisma migrate deploy"
- Ensure `DATABASE_URL` environment variable is set in Vercel
- Check that your database is accessible from Vercel's IP

### Build Fails: "PrismaClientValidationError"
- Clear `.prisma` cache: `rm -rf .prisma node_modules`
- Run `npm install` and redeploy

### Database Connection Timeout
- Check database firewall rules allow Vercel IPs
- Verify DATABASE_URL is correct
- Test connection string locally first

### Data Loss After Deployment
- If using SQLite (file: ./dev.db), this is expected on Vercel
- Switch to a persistent database (PostgreSQL, MySQL, etc.)

## Production Checklist

- [ ] Switch from SQLite to production database
- [ ] Set DATABASE_URL in Vercel environment variables
- [ ] Run `npm run build` locally (should succeed)
- [ ] Push to GitHub
- [ ] Deploy via Vercel
- [ ] Check build logs for migrations
- [ ] Test all features on deployed URL
- [ ] Monitor Vercel logs for errors
- [ ] Set up automatic deployments on push

## Recommended Database for Production

**Vercel Postgres** - Best for Vercel deployments
- Integrated with Vercel dashboard
- Automatic environment variables
- Free tier available
- No IP whitelist needed
- Same region as your functions

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
