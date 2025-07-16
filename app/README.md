# 📝 NFT App - Nifty Frogs ✨

A modern application built with Next.js.

## Environment Setup

1. Duplicate the `.env.example` file and rename it to `.env` and need change variables for connect database:
```bash
cp .env.example .env
```

2. Run the development server:

```bash
pnpm db:push # added entities to Date Base

pnpm dev
```

## Production

```bash
pnpm db:migrate deploy # added entities to Date Base

pnpm build

pnpm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
