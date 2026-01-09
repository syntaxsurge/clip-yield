# ClipYield

ClipYield is a creator-first short video platform that lets fans and brands boost creators with yield-bearing RWA assets. This repository contains the Next.js 15 App Router frontend, Convex data layer, and a Hardhat workspace for Mantle Sepolia.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Convex
- Mantle Sepolia (EVM)

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

3. Start Convex dev and the web app:

```bash
pnpm convex:dev
pnpm dev
```

## Core Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm convex:dev
pnpm build:contracts
```

## Hardhat (Mantle Sepolia)

```bash
cd blockchain/hardhat
pnpm install
cp ../.env.example ../.env
pnpm run compile
```

Update `blockchain/.env` with `PRIVATE_KEY` and `API_KEY` before deploying.

Deploy and verify the RealFi contracts:

```bash
pnpm hardhat ignition deploy ./ignition/modules/ClipYieldModule.ts \
  --network mantleSepolia \
  --deployment-id clipyield-mantle-sepolia \
  --verify
```

Then sync ABIs + update local contract addresses (defaults to `clipyield-mantle-sepolia`; pass `-- <deployment-id>` to override):

```bash
cd ../..
pnpm contracts:sync
```
