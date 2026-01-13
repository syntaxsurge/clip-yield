# ClipYield

Creator-first short-video platform where sponsorships are tokenized as on-chain invoice receipts and protocol fees stream into KYC-gated yield vaults on Mantle.

## Mantle Global Hackathon 2025 (Submission)

- **Primary track:** RWA / RealFi
- **Additional track alignments:** DeFi & Composability, AI & Oracles, Infrastructure & Tooling, GameFi & Social
- **Target categories:** Grand Prize, Best Mantle Integration, Best UX / Demo
- **Network:** Mantle Sepolia (`5003`), asset is `WMNT`
- **Demo runbook:** `docs/youtube-demo-script.md`
- **Optional redirects:** `/demo-video` (set `DEMO_VIDEO_URL`) and `/pitch-deck` (set `PITCH_DECK_URL`)

## What ClipYield Builds

ClipYield turns sponsorship spend into auditable, compliant on-chain cash-flow primitives:

- **Fans + brands** sponsor clips with WMNT and mint an **Invoice Receipt NFT** containing the sponsorship **terms hash** and payment metadata.
- **Creators** receive sponsorship payouts as **ERC-4626 boost vault shares** (per-creator vaults), so future yield + donations accrue transparently.
- **Protocol fees** route into a **KYC-gated ERC-4626 yield vault**, designed for compliant yield distribution.
- **KYC is enforced on-chain** (no PII on-chain): vault actions + receipt transfers require a verified wallet in `KycRegistry`.
- **Creator tooling** includes an **AI-assisted editor** (Remotion + FFmpeg WASM) with Sora BYOK for generating clips, editing, and exporting MP4s.

## One-Pager (Problem → Solution → Why It Wins)

### Problem

Creators and sponsors struggle with (1) **un-auditable off-chain sponsorship deals**, (2) **unclear payment terms + deliverables**, (3) **no compliant rails** for routing yield-bearing cash-flows on-chain, and (4) **high content production costs** that slow creator iteration.

### Solution

ClipYield makes sponsorship a RealFi primitive:

- Sponsorship terms become a **canonical JSON payload**, hashed and anchored on-chain as a **terms hash**.
- Payment becomes a **tokenized invoice receipt** (ERC-721) that sponsors can prove on-chain.
- Creator payouts deposit into **per-creator ERC-4626 boost vaults** (standardized, composable accounting).
- Protocol fees fund a **KYC-gated ERC-4626 yield vault**, creating a compliant yield stream for the ecosystem.
- The creator workflow includes an **AI-first editor** so content velocity matches the economics.

### Custody + cash-flow model

- **Non-custodial:** sponsorships transfer directly from sponsor wallets into protocol contracts on Mantle.
- **Explicit splits:** `ClipYieldSponsorHub` computes protocol fee vs creator payout on-chain.
- **Compliant participation:** vault and receipt ownership is gated by `KycRegistry` (no identity data stored on-chain).

### Business model (MVP)

- **Protocol fee bps on sponsorships** (routed into the yield vault and fully auditable on-chain).
- **Premium creator tooling** can be added on top of the editor workflow (optional), without changing the on-chain primitives.

### Roadmap

- Replace `SimulatedYieldStreamer` with real yield sources (Mantle-native DeFi rails) and automated harvesting.
- Expand receipt metadata with optional off-chain storage (IPFS/Arweave) referenced by the on-chain terms hash.
- Upgrade KYC flows toward selective disclosure / ZK-KYC patterns while keeping the on-chain registry interface stable.

## Track Alignment (How This Matches Mantle’s Criteria)

### RWA / RealFi (Top Priority)

Hackathon focus: tokenization of invoices/cash-flows, KYC flows, custody models, compliant yield distribution.

- **Tokenized invoices:** Sponsorships mint **`ClipYieldInvoiceReceipts` (ERC-721)** with campaign ID, terms hash, and payment breakdown.
- **Compliant gating:** **`KycRegistry`** gates sponsorship eligibility, ERC-4626 deposits/withdrawals, and receipt transfers (restricted to verified wallets).
- **Cash-flow routing:** **`ClipYieldSponsorHub`** splits sponsorship payments into creator payout + protocol fee; fees route to the yield vault.
- **Yield distribution rails:** **`ClipYieldVault` (ERC-4626)** is KYC-gated for deposits/withdrawals/transfers, supporting regulated participation.

### DeFi & Composability

Hackathon focus: lending/collateral strategies, composable yield optimizers, synthetic assets backed by RWA.

- **ERC-4626 everywhere:** both the protocol vault and per-creator boost vaults are **ERC-4626**, enabling standard integrations and predictable accounting.
- **Composable flows:** SponsorHub composes `transferFrom → fee split → ERC-4626 deposit`, producing a single on-chain source of truth per sponsorship.
- **Per-creator vault factory:** `ClipYieldBoostVaultFactory` deterministically provisions a vault for each verified creator.

### AI & Oracles

Hackathon focus: smart automation using LLMs/agents, on-chain/off-chain data pipelines for asset management.

- **AI creation pipeline:** Sora-powered clip generation integrates directly into the editor workflow (BYOK key stored in encrypted HTTP-only cookies).
- **On-chain/off-chain pipeline:** Convex jobs confirm Mantle tx inclusion and derive app-ready receipts, activity rows, and leaderboard snapshots.
- **Terms hashing:** Canonical terms JSON is hashed client-side (`keccak256`) to create a tamper-evident link between UX and on-chain receipts.

### Infrastructure & Tooling

Hackathon focus: SDKs, wallet tooling, monitoring dashboards, DevOps pipelines.

- **Contract ops automation:** `scripts/sync-contracts.ts` syncs deployed contract addresses into `.env.local` and writes ABIs to `src/lib/contracts/abi`.
- **Operator consoles:** `/admin/kyc` for KYC registry actions and `/admin/boost-pass` for managing Boost Pass epochs.
- **Editor pipeline:** Remotion + FFmpeg WASM assets are vendored into `public/ffmpeg` with a reproducible sync script.

### GameFi & Social

Hackathon focus: consumer apps integrating RWA/yield logic + retention mechanics.

- **Social core loop:** For You feed, Following feed, creator profiles, likes, comments, and share flows.
- **Retention mechanics:** on-chain activity feed + leaderboards + **Boost Pass** (soulbound ERC-1155) perks gated by both eligibility and KYC.

## Judging Criteria (How Judges Can Evaluate ClipYield)

- **Technical excellence:** Next.js 15 App Router + Convex + Mantle contracts; ERC-4626 vault standardization; reproducible ABI/address syncing.
- **User experience:** consumer-first vertical feed, guided onboarding (`/start`), wallet-gated skeletons, end-to-end sponsor + receipt UX.
- **Real-world applicability:** tokenized sponsorship invoices with explicit terms hash, KYC-gated participation, and auditable cash-flow routing.
- **Mantle integration:** WMNT + Mantle Sepolia transactions, MantleScan links, faucet/bridge onboarding, contract catalog at `/contract-addresses`.
- **Long-term ecosystem potential:** expandable rails for creator financing, protocol-fee funded yield vaults, perks/epochs, and creator tooling.

## Quick Judge Walkthrough (5 minutes)

1. `/start` → connect wallet + get Mantle Sepolia WMNT (faucet/bridge links).
2. `/` → open a clip → `/post/[postId]/[userId]` for comments/social proof.
3. `/sponsor/[postId]` → enter terms + sponsor amount → mint Invoice Receipt NFT → view `/campaign/[campaignId]`.
4. `/yield` → view KYC-gated yield vault state + simulated yield streaming.
5. `/projects` → create a project → `/projects/[id]` → generate with Sora → export MP4 → `/upload`.
6. `/activity` + `/leaderboard` → verify events and rankings with explorer links.

For a full recorded demo script (screen-by-screen + voiceover), see `docs/youtube-demo-script.md`.

## Architecture

### App stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend:** Convex (profiles, posts, comments, follows, projects, campaigns, receipts, KYC records, leaderboards)
- **Wallet + web3:** Privy + wagmi/viem on Mantle Sepolia
- **Editor:** Remotion + FFmpeg WASM, Redux Toolkit + IndexedDB persistence (scoped to connected wallet)

### Key routes

- **Feeds & social:** `/`, `/following`, `/creators`, `/profile/[id]`, `/post/[postId]/[userId]`
- **Sponsorship + receipts:** `/sponsor/[postId]`, `/campaign/[campaignId]`, `/activity`, `/leaderboard`
- **Vaults:** `/yield`, `/boost/[creatorId]`, `/kyc`, `/kyc/complete`, `/contract-addresses`
- **Creator tooling:** `/projects`, `/projects/[id]`, `/upload`, `/settings`
- **Admin:** `/admin/kyc`, `/admin/boost-pass`

### API endpoints

- **KYC:** `/api/kyc/start`, `/api/kyc/sync`, `/api/kyc/reset`
- **Creator vault provisioning:** `/api/creator-vault/resolve`
- **AI BYOK + Sora:** `/api/settings/openai-key`, `/api/sora`, `/api/sora/content`
- **Perks:** `/api/boost-pass/remix-pack`, `/api/sponsor/remix-pack`

### Smart contracts (`blockchain/contracts/realfi`)

- `KycRegistry`: on-chain verification status (gates vault actions + receipt transfers).
- `ClipYieldVault` (ERC-4626): KYC-gated protocol vault; receives protocol fees + yield donations.
- `ClipYieldBoostVaultFactory`: deploys one boost vault per verified creator.
- `ClipYieldBoostVault` (ERC-4626): creator-specific vault; sponsorship payouts deposit as shares; yield donations can pay creator cut + increase share value.
- `ClipYieldSponsorHub`: sponsorship entrypoint; fee split + deposit into boost vault; mints receipt NFT.
- `ClipYieldInvoiceReceipts` (ERC-721): tokenized invoice receipts with on-chain metadata + KYC-gated transfers.
- `ClipYieldBoostPass` (ERC-1155): soulbound, epoch-based perk pass (claim gated by eligibility + KYC).
- `SimulatedYieldStreamer`: testnet yield stream simulator that drips WMNT to the protocol vault.

## Local Development

### Prereqs

- Node.js 20+
- pnpm

### Setup

```bash
pnpm install
cp .env.example .env.local
```

Populate the required env vars in `.env.local` (see `.env.example`). For the full on-chain experience you must set the `NEXT_PUBLIC_*_ADDRESS` contract vars; the easiest path is to deploy contracts and run `pnpm contracts:sync`.

Then run the app (2 terminals):

```bash
# terminal 1
pnpm convex:dev

# terminal 2
pnpm dev
```

Useful commands:

```bash
pnpm lint
pnpm typecheck
pnpm ffmpeg:sync-core
pnpm convex:deploy
pnpm convex:reset
```

### Required configuration (high level)

See `.env.example` for the canonical list. The most important vars for a full demo are:

- **Convex:** `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`
- **Privy:** `NEXT_PUBLIC_PRIVY_APP_ID`
- **Mantle contracts (public):** `NEXT_PUBLIC_KYC_REGISTRY_ADDRESS`, `NEXT_PUBLIC_CLIPYIELD_VAULT_ADDRESS`, `NEXT_PUBLIC_BOOST_FACTORY_ADDRESS`, `NEXT_PUBLIC_SPONSOR_HUB_ADDRESS`, `NEXT_PUBLIC_INVOICE_RECEIPTS_ADDRESS`, `NEXT_PUBLIC_BOOST_PASS_ADDRESS`, `NEXT_PUBLIC_YIELD_STREAMER_ADDRESS`
- **KYC (Persona):** `PERSONA_API_KEY`, `PERSONA_ENVIRONMENT_ID`, `PERSONA_INQUIRY_TEMPLATE_ID` (+ server KYC manager keys)
- **AI Studio:** `OPENAI_BYOK_COOKIE_SECRET` (OpenAI API key is BYOK via `/settings`)

## Contracts (Hardhat / Mantle Sepolia)

1. Create a deployer env file:

```bash
cp blockchain/.env.example blockchain/.env
```

2. Compile:

```bash
pnpm build:contracts
```

3. Deploy + verify (Ignition):

```bash
pnpm --filter blockchain-hardhat exec hardhat ignition deploy ./ignition/modules/ClipYieldModule.ts \
  --network mantleSepolia \
  --deployment-id clipyield-mantle-sepolia \
  --verify
```

4. Sync ABIs + write addresses into `.env.local` (defaults to `clipyield-mantle-sepolia`):

```bash
pnpm contracts:sync
```

## Notes on Privacy, Security, and Compliance

- **No KYC PII on-chain:** on-chain contracts store only boolean verification state; Persona hosts the identity flow.
- **BYOK keys:** OpenAI keys are stored in encrypted HTTP-only cookies (server-only secret: `OPENAI_BYOK_COOKIE_SECRET`).
- **Testnet disclaimer:** Mantle Sepolia flows are for demo/MVP validation and are not financial advice.
