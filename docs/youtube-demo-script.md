Project: ClipYield  
One-liner: A creator-first short‑video platform where fans sponsor clips using KYC‑gated, yield‑bearing WMNT vaults on Mantle Sepolia—then unlock remix perks to create and re‑upload boosted edits.

## 1. For You Feed (Short‑form Consumer App)
- **URL:** /
- **Shot:** “For You” feed with vertical autoplay clips, right-rail actions (Like/Comment/Share), visible creator handle on each clip, and top navigation showing “For You” and “Following”.
- **Steps:**
  1. **Current page:** New browser tab — confirm the tab is open and idle.
  2. **Navigate:** Open URL directly: `/` → lands on `/` — confirm the top nav shows “For You” selected and the feed is autoplaying a clip.
  3. **Action:** **Current page:** `/` — scroll the feed one clip down using the mouse wheel — confirm the next clip autoplays and the creator handle updates on-screen.
  4. **Action:** **Current page:** `/` — click the “❤ Like” button on the right rail — confirm the like state toggles (icon fills/animates) and the like count increments.
  5. **Action:** **Current page:** `/` — pause briefly on the CTA area (the sponsor/boost affordance on the clip card) — confirm a visible “Sponsor”/“Boost” callout is present on the clip UI.
  6. **Verify on-screen:** **Current page:** `/` — confirm you can see (1) an autoplaying clip, (2) a creator handle, and (3) “For You” selected in the top nav.
- **Voiceover:**
  > “This is ClipYield’s ‘For You’ feed: a TikTok-style, mobile-first experience, but built around real on-chain value. You can like and engage instantly, and every clip is sponsorable and boostable with yield logic on Mantle. Now let’s open a clip and see the social + monetization layer.”

## 2. Post Detail + Comments (Social Proof + Engagement Loop)
- **URL:** /post/[postId]/[userId]
- **Shot:** Post detail view with the clip, a comments panel/list, and engagement actions; a visible “Sponsor” entry point for the clip.
- **Steps:**
  1. **Current page:** `/` — confirm “For You” is selected and a clip is visible.
  2. **Navigate:** **Current page:** `/` — click the “💬 Comments” button on the right rail → lands on `/post/[postId]/[userId]` — confirm a “Comments” panel/heading is visible next to the clip.
  3. **Action:** **Current page:** `/post/[postId]/[userId]` — click the comment input labeled “Add a comment…” — confirm the cursor is active in the input.
  4. **Enter values:**
     - Add a comment… = `[COMMENT_TEXT="Boosted this creator — the Remix Pack is 🔥"]`
  5. Click **Post** — wait for the new comment to appear in the comments list.
  6. **Verify on-screen:** **Current page:** `/post/[postId]/[userId]` — confirm your comment appears as a new row/item at the top/bottom of the list with your profile identity.
- **Voiceover:**
  > “On every clip, ClipYield keeps the experience familiar: comments, reactions, and creator discovery. I’m posting ‘Boosted this creator — the Remix Pack is 🔥’ to show the social layer, because this matters for the GameFi & Social track: retention is built into the core interaction loop. Next, we jump to the creator profile to follow and boost them.”

## 3. Creator Profile + Follow (Social Graph + Creator Surface)
- **URL:** /profile/[id]
- **Shot:** Creator profile header (avatar/handle), Follow button, creator posts grid/list, and a clear creator monetization CTA (Boost/Sponsor).
- **Steps:**
  1. **Current page:** `/post/[postId]/[userId]` — confirm the comments panel and clip are visible.
  2. **Navigate:** **Current page:** `/post/[postId]/[userId]` — click the creator handle (e.g., “@creator”) → lands on `/profile/[id]` — confirm the profile header is visible with a **Follow** button.
  3. **Action:** **Current page:** `/profile/[id]` — click **Follow** — confirm the button label changes to “Following” (or “Unfollow”) and the follower state updates.
  4. **Action:** **Current page:** `/profile/[id]` — scroll to the creator’s posts list/grid — confirm multiple posts are visible under the profile.
  5. **Action:** **Current page:** `/profile/[id]` — point out the creator CTA (“Boost” / “Sponsor”) in the profile UI — confirm it is visible as a button or panel.
  6. **Verify on-screen:** **Current page:** `/profile/[id]` — confirm the profile shows (1) “Following” state and (2) creator posts and (3) a visible Boost/Sponsor action.
- **Voiceover:**
  > “This profile view is where ClipYield turns creators into businesses. I follow the creator so they show up in my Following feed, and you can see the creator’s clips and the monetization CTAs like Boost and Sponsor. This is the social foundation that makes the RealFi mechanics actually distribute to people users care about. Next, I’ll prove the social graph by switching to the Following feed.”

## 4. Following Feed (Retention + Social Distribution)
- **URL:** /following
- **Shot:** “Following” feed view with clips only from followed creators; visible “Following” tab selected.
- **Steps:**
  1. **Current page:** `/profile/[id]` — confirm the button shows “Following” (or equivalent).
  2. **Navigate:** **Current page:** `/profile/[id]` — click **Following** in the top navigation → lands on `/following` — confirm the page/tab heading shows “Following”.
  3. **Action:** **Current page:** `/following` — scroll one clip down — confirm the next clip loads/autoplays and the creator handle matches a followed creator.
  4. **Action:** **Current page:** `/following` — click the creator handle on a clip to confirm it’s from your followed creator — confirm the creator identity matches the profile you followed.
  5. **Action:** **Current page:** `/following` — return back using the browser Back button — confirm you return to `/following` with “Following” still selected.
  6. **Verify on-screen:** **Current page:** `/following` — confirm the feed is filtered and the “Following” tab is visibly active.
- **Voiceover:**
  > “Now we’re on the Following feed—this is the retention engine. It’s not just a random feed; it’s your social graph. That matters because ClipYield’s incentives—boosts, sponsorships, and perks—work best when users repeatedly return to creators they follow. Next, we’ll onboard to Mantle Sepolia so we can demonstrate the RealFi and KYC requirements end-to-end.”

## 5. Mantle Sepolia Onboarding Wizard (Wallet + Faucet/Bridge + WMNT Wrap)
- **URL:** /start
- **Shot:** Step-by-step onboarding wizard showing wallet connect, Mantle Sepolia network readiness, links to faucet/bridge, and a WMNT wrap step.
- **Steps:**
  1. **Current page:** `/following` — confirm “Following” is selected in the top nav.
  2. **Navigate:** **Current page:** `/following` — open **Explore** in the header → select **Start onboarding** → lands on `/start` — confirm a page heading like “Start on Mantle Sepolia” and the step list is visible.
  3. **Action:** **Current page:** `/start` — click **Connect Wallet** — confirm a wallet modal opens and you see your wallet option (e.g., “MetaMask”).
  4. **Action:** **Current page:** `/start` — select **MetaMask** (or your wallet) and approve connection — confirm a connected wallet indicator appears (e.g., “0x…”) and the network shows “Mantle Sepolia”.
  5. **Action:** **Current page:** `/start` — click **Open Faucet** — confirm a new tab opens to Mantle Sepolia faucet at `https://faucet.sepolia.mantle.xyz/`.
  6. **Verify on-screen:** **Current page:** `/start` — confirm the wizard shows Mantle Sepolia readiness (Chain ID 5003) and the WMNT wrap step is visible as the next action.
- **Voiceover:**
  > “This onboarding is designed for demo clarity and real users: connect a wallet, switch to Mantle Sepolia, and you’re guided to the official faucet at https://faucet.sepolia.mantle.xyz/. Mantle Sepolia runs Chain ID 5003, so everything we do next is real on-chain behavior, not a mock. With the wallet connected and WMNT ready, we can do compliant yield flows—so let’s start KYC.”

## 6. KYC Entry Point (Persona Hosted Flow Start)
- **URL:** /kyc
- **Shot:** KYC landing page that clearly states verification status and has a single “Start verification” CTA; transition to Persona hosted flow.
- **Steps:**
  1. **Current page:** `/start` — confirm the onboarding stepper is visible and wallet is connected.
  2. **Navigate:** **Current page:** `/start` — open **Explore** in the header → select **KYC verification** → lands on `/kyc` — confirm a heading like “KYC Verification” and a **Start Verification** button is visible.
  3. **Action:** **Current page:** `/kyc` — click **Start Verification** — confirm you are redirected to a Persona hosted flow (new tab or same tab) and you see “Persona” branding.
  4. **Action:** **Current page:** Persona hosted flow — pause on the first Persona screen — confirm “Identity Verification” (or similar) is visible.
  5. **Action:** **Current page:** Persona hosted flow — click **Continue** (Persona) to proceed — confirm Persona advances to the next step screen.
  6. **Verify on-screen:** **Current page:** Persona hosted flow — confirm you are inside an active KYC flow and the user is not manually sharing keys or secrets in the app UI.
- **Voiceover:**
  > “This is ClipYield’s compliance gate for the RealFi track. We start on /kyc, then launch a Persona hosted verification flow—this gives a real, production-grade KYC journey. Importantly, users never handle private keys beyond their wallet; KYC is a separate verified identity step. Once the KYC is completed, we’ll return to ClipYield and show that verification is written into the on-chain KYC registry.”

## 7. KYC Completion (Return + Verified Status)
- **URL:** /kyc/complete
- **Shot:** KYC completion page showing status (Approved/Submitted), wallet verification state, and a CTA to continue to vault interactions.
- **Steps:**
  1. **Current page:** Persona hosted flow — confirm you’re on the final step screen (completion/review state).
  2. **Navigate:** **Current page:** Persona hosted flow — click **Finish** (or the final completion button) → redirects back to `/kyc/complete` — confirm a status badge like “KYC Submitted” or “KYC Verified” appears.
  3. **Action:** **Current page:** `/kyc/complete` — click **Refresh Status** (if available) — confirm the status updates to “Verified” and the wallet address is shown as linked.
  4. **Action:** **Current page:** `/kyc/complete` — click **Continue to Yield** — confirm you’re ready to proceed (the button is enabled and a success badge remains visible).
  5. Click **Continue to Yield** — wait for navigation readiness (button state/loader completes).
  6. **Verify on-screen:** **Current page:** `/kyc/complete` — confirm the visible state indicates verification is complete and you can proceed to yield/boost flows.
- **Voiceover:**
  > “KYC is complete, and we’re back on /kyc/complete with a clear ‘Verified’ state. This is critical for the Mantle RealFi track: compliant yield distribution means access control. In ClipYield, verification ties back to your wallet so vault interactions can be permissioned on-chain. Next, I’ll show the admin KYC console that confirms the on-chain update, then we’ll move into the yield vault.”

## 8. Admin KYC Console (On‑Chain Verification Proof)
- **URL:** /admin/kyc
- **Shot:** Admin console with a KYC table (wallets/inquiries), statuses, and on-chain sync/tx info.
- **Steps:**
  1. **Current page:** `/kyc/complete` — confirm the “Verified” status badge is visible.
  2. **Navigate:** **Current page:** `/kyc/complete` — open **Explore** in the header → select **KYC console** → lands on `/admin/kyc` — confirm the heading “KYC Admin” and a table of KYC records appears.
  3. **Action:** **Current page:** `/admin/kyc` — locate your wallet row and click **View Details** (or row expansion) — confirm you see fields like wallet address and status “Verified”.
  4. **Action:** **Current page:** `/admin/kyc` — click **View on MantleScan** for the on-chain KYC update (if present) — confirm a new tab opens to `https://sepolia.mantlescan.xyz/` with the transaction page.
  5. **Action:** **Current page:** `/admin/kyc` — return to the app tab and click **Back** (or close details) — confirm you return to the KYC table view.
  6. **Verify on-screen:** **Current page:** `/admin/kyc` — confirm the KYC record shows a “Verified” state plus on-chain proof (tx hash/explorer link).
- **Voiceover:**
  > “Here’s the operational side: the /admin/kyc console. We can see the wallet’s KYC status and the on-chain proof via MantleScan on Mantle Sepolia. This is how judges can validate it’s not a placeholder—verification is auditable. With KYC verified, we can safely demonstrate yield vault access next.”

## 9. Yield Vault (KYC‑Gated RealFi + DeFi Mechanics)
- **URL:** /yield
- **Shot:** Vault UI showing KYC status, deposit/withdraw panels, balances, and transaction status.
- **Steps:**
  1. **Current page:** `/admin/kyc` — confirm you can see the KYC table.
  2. **Navigate:** **Current page:** `/admin/kyc` — open **Explore** in the header → select **Yield vault** → lands on `/yield` — confirm a page heading like “Yield Vault” and a “KYC Verified” badge is visible.
  3. **Action:** **Current page:** `/yield` — click **Deposit** — confirm a deposit modal/panel opens with an amount input.
  4. **Enter values:**
     - Amount (WMNT) = `[DEPOSIT_WMNT=5]`
  5. Click **Confirm Deposit** — wait for the wallet confirmation and a “Transaction Submitted” toast/state.
  6. **Verify on-screen:** **Current page:** `/yield` — confirm your vault position updates (shares/balance increases) and a tx hash link appears or a “Confirmed” status is shown.
- **Voiceover:**
  > “This is the core RealFi demo: a KYC-gated yield vault on Mantle Sepolia. I deposit 5 WMNT, confirm in my wallet, and the UI shows transaction submission and confirmation. The key point is custody: users sign with their wallet, and the vault is the on-chain system of record. Next, we’ll apply this to creators by depositing into a per-creator Boost Vault.”

## 10. Creator Boost Vault (Creator‑Directed Yield + Funding)
- **URL:** /boost/[creatorId]
- **Shot:** Per-creator boost vault page showing creator identity, deposit panel, your boost position, and KYC gating state.
- **Steps:**
  1. **Current page:** `/yield` — confirm your vault position is visible and KYC status is “Verified”.
  2. **Navigate:** **Current page:** `/yield` — click **Boost a Creator** (or **Boost**) and select a creator row/button (e.g., “Boost @creator”) → lands on `/boost/[creatorId]` — confirm the page shows the creator handle and “Boost Vault”.
  3. **Action:** **Current page:** `/boost/[creatorId]` — click **Deposit Boost** — confirm an amount input is visible.
  4. **Enter values:**
     - Amount (WMNT) = `[BOOST_WMNT=1]`
  5. Click **Confirm Boost Deposit** — wait for wallet confirmation and a “Boost deposit submitted” toast/state.
  6. **Verify on-screen:** **Current page:** `/boost/[creatorId]` — confirm “Your Boost Position” (or equivalent) updates and a tx hash link is displayed.
- **Voiceover:**
  > “Boosting is where ClipYield merges social and finance. Instead of random yield farming, you direct 1 WMNT into a creator-specific Boost Vault. It’s composable DeFi mechanics, but with a consumer-social wrapper. This is also the foundation for sponsorship campaigns—so next I’ll sponsor a specific clip and generate an on-chain campaign receipt.”

## 11. Sponsor a Clip (Campaign Creation + Direct Creator Monetization)
- **URL:** /sponsor/[postId]
- **Shot:** Sponsorship page tied to a specific clip, showing clip preview, sponsor amount panel, and a primary CTA to confirm sponsorship.
- **Steps:**
  1. **Current page:** `/boost/[creatorId]` — confirm your boost position is visible for the creator.
  2. **Navigate:** **Current page:** `/boost/[creatorId]` — click **Sponsor a Clip** → lands on `/sponsor/[postId]` — confirm a clip preview is visible and the heading shows “Sponsor”.
  3. **Action:** **Current page:** `/sponsor/[postId]` — click the sponsor amount input labeled “Amount (WMNT)” — confirm the cursor is active.
  4. **Enter values:**
     - Amount (WMNT) = `[SPONSOR_WMNT=2]`
  5. Click **Confirm Sponsorship** — wait for wallet confirmation and a “Campaign created” / “Transaction submitted” state.
  6. **Verify on-screen:** **Current page:** `/sponsor/[postId]` — confirm you see a success state (toast, status badge, or redirect prompt) indicating the sponsorship is created.
- **Voiceover:**
  > “Sponsorship is the revenue engine for creators. Here I sponsor this specific clip with 2 WMNT. In one click, it becomes an on-chain action that funds the creator and creates an auditable receipt—this is RealFi in a format creators actually want. Next we’ll land on the campaign receipt page that proves the terms hash and transaction status.”

## 12. Campaign Receipt + Finality Panel (On‑Chain Proof + Mantle UX)
- **URL:** /campaign/[campaignId]
- **Shot:** Campaign receipt page with campaign ID, terms hash, tx status, links to MantleScan, and a finality panel using rollup status.
- **Steps:**
  1. **Current page:** `/sponsor/[postId]` — confirm the sponsorship success state is visible.
  2. **Navigate:** **Current page:** `/sponsor/[postId]` — wait for auto-redirect (or click **View Receipt**) → lands on `/campaign/[campaignId]` — confirm a “Campaign Receipt” heading and “Terms Hash” are visible.
  3. **Action:** **Current page:** `/campaign/[campaignId]` — click **View Transaction on MantleScan** — confirm a new tab opens to `https://sepolia.mantlescan.xyz/` on the transaction detail page.
  4. **Action:** **Current page:** `/campaign/[campaignId]` — return to the receipt tab and scroll to the “Finality” panel — confirm you see rollup inclusion/finality status text.
  5. **Action:** **Current page:** `/campaign/[campaignId]` — click **Copy Terms Hash** — wait for a “Copied” toast.
  6. **Verify on-screen:** **Current page:** `/campaign/[campaignId]` — confirm you can see (1) a terms hash, (2) tx status, and (3) MantleScan link proof.
- **Voiceover:**
  > “This receipt is what makes the demo judge-friendly: it shows a terms hash, transaction status, and a direct MantleScan link on Mantle Sepolia. We also surface a finality panel so users understand when an L2 transaction is included and stable. This is real on-chain transparency—not screenshots—so next we’ll open the Activity feed, where every boost and sponsorship becomes a public event stream.”

## 13. On‑Chain Activity Feed (Transparent Event Ledger)
- **URL:** /activity
- **Shot:** Paginated activity list showing events (boost deposits, sponsorships), amounts, timestamps, and MantleScan links.
- **Steps:**
  1. **Current page:** `/campaign/[campaignId]` — confirm the receipt is visible with tx status.
  2. **Navigate:** **Current page:** `/campaign/[campaignId]` — open **Explore** in the header → select **Activity feed** → lands on `/activity` — confirm the heading “Activity” and a list/table of events is visible.
  3. **Action:** **Current page:** `/activity` — click **Next** in pagination — confirm new rows/events load and the page indicator updates (e.g., “Page 2”).
  4. **Action:** **Current page:** `/activity` — click **View on MantleScan** on an event row — confirm a new tab opens to `https://sepolia.mantlescan.xyz/` for that tx.
  5. **Action:** **Current page:** `/activity` — return to the app and click **Previous** in pagination — confirm the event list returns to the prior page.
  6. **Verify on-screen:** **Current page:** `/activity` — confirm event rows include tx hashes/links and clear event types (Boost/Sponsor/Vault).
- **Voiceover:**
  > “This Activity feed is the public ledger of engagement: boosts, sponsorships, and vault actions all show up as verifiable events with MantleScan links. That’s essential for both RealFi credibility and social trust—users can see what actually happened on-chain. Next we’ll convert that activity into a ranked leaderboard, which powers incentives and retention.”

## 14. Leaderboard (GameFi & Social Incentives + Rankings)
- **URL:** /leaderboard
- **Shot:** Leaderboard view with ranked creators/campaigns, totals (boost/sponsor amounts), and clickable rows.
- **Steps:**
  1. **Current page:** `/activity` — confirm the event list is visible.
  2. **Navigate:** **Current page:** `/activity` — open **Explore** in the header → select **Leaderboard** → lands on `/leaderboard` — confirm a “Leaderboard” heading and ranked rows are visible.
  3. **Action:** **Current page:** `/leaderboard` — find the creator you boosted/sponsored and click their row — confirm a detail panel or link target appears (profile/campaign highlight).
  4. **Action:** **Current page:** `/leaderboard` — click **View Profile** (or the creator handle link) — confirm the profile opens (creator identity visible).
  5. **Action:** **Current page:** `/leaderboard` — return back using the browser Back button — confirm you’re back on `/leaderboard` with rankings still visible.
  6. **Verify on-screen:** **Current page:** `/leaderboard` — confirm your recent boost/sponsor activity is reflected in ranking totals or highlighted rows.
- **Voiceover:**
  > “This is the GameFi & Social layer: leaderboards turn financial actions into status and competition. Boosting and sponsoring aren’t hidden—your on-chain activity translates into rankings, which drives repeat engagement. And because the leaderboard is computed from confirmed on-chain events, it’s resilient and auditable. Next, we’ll publish a Boost Pass epoch from these snapshots—turning rankings into tokenized perks.”

## 15. Admin Boost Pass (Publish Incentive Epochs On‑Chain)
- **URL:** /admin/boost-pass
- **Shot:** Admin Boost Pass page showing leaderboard snapshots, epoch controls, and a publish action that generates an on-chain tx.
- **Steps:**
  1. **Current page:** `/leaderboard` — confirm ranked rows are visible.
  2. **Navigate:** **Current page:** `/leaderboard` — open **Explore** in the header → select **Boost Pass admin** → lands on `/admin/boost-pass` — confirm a heading like “Boost Pass Admin” and an epoch/snapshot table is visible.
  3. **Action:** **Current page:** `/admin/boost-pass` — select the latest snapshot row and click **Publish Epoch** — confirm a transaction prompt or “Publishing…” state appears.
  4. **Action:** **Current page:** `/admin/boost-pass` — confirm in wallet if prompted — wait for a “Epoch published” toast/state.
  5. **Action:** **Current page:** `/admin/boost-pass` — click **View on MantleScan** for the epoch tx — confirm `https://sepolia.mantlescan.xyz/` opens on the tx page.
  6. **Verify on-screen:** **Current page:** `/admin/boost-pass` — confirm a new epoch row appears (or status updates) with an on-chain tx hash.
- **Voiceover:**
  > “Here’s how incentives become real: we publish Boost Pass epochs based on confirmed leaderboard snapshots. This is token incentive design in a way creators understand—rank higher, unlock more perks. The publish action produces an on-chain transaction, so the perk eligibility is verifiable. Next, we’ll switch to the user-facing perks page, download the Remix Pack, and import it directly into the editor.”

## 16. Boost Pass Perks (Remix Pack Download + Import)
- **URL:** /perks/boost-pass
- **Shot:** Perks page showing Boost Pass ownership check, a “Download Remix Pack” button, and an “Import to Projects” CTA.
- **Steps:**
  1. **Current page:** `/admin/boost-pass` — confirm the published epoch status is visible.
  2. **Navigate:** **Current page:** `/admin/boost-pass` — open **Explore** in the header → select **Boost Pass perks** → lands on `/perks/boost-pass` — confirm a “Boost Pass” heading and an ownership status (✅) is visible.
  3. **Action:** **Current page:** `/perks/boost-pass` — click **Download Remix Pack** — wait for a “Download started” toast or browser download.
  4. **Action:** **Current page:** `/perks/boost-pass` — click **Import to Projects** — confirm navigation begins (loader/redirect).
  5. Click **Import to Projects** — wait for redirect — confirm you land on `/projects`.
  6. **Verify on-screen:** **Current page:** `/projects` — confirm a toast like “Remix Pack imported” or a new project row appears.
- **Voiceover:**
  > “This is the addictive creator loop: earn a Boost Pass, then unlock a Remix Pack that you can immediately use. The perks page verifies ownership, lets you download the pack, and imports it into the editor in one click. That’s retention through creation: incentives become tools creators actually want. Next, we’ll open the Projects list and jump into the CapCut-style editor to produce a remix.”

## 17. Projects List (Creator Workspace)
- **URL:** /projects
- **Shot:** Projects table/list showing existing projects, an imported Remix Pack project entry, and actions like Open/Import/Export.
- **Steps:**
  1. **Current page:** `/projects` — confirm the Projects heading and project list/table are visible.
  2. **Navigate:** **Current page:** `/projects` — click the imported project row labeled “Boost Pass Remix Pack” (or click **Open** on that row) → lands on `/projects/[id]` — confirm the editor loads with timeline UI.
  3. **Action:** **Current page:** `/projects/[id]` — pause to show the timeline and preview canvas — confirm clips/assets are present in the timeline.
  4. **Action:** **Current page:** `/projects/[id]` — click **Back to Projects** — confirm you return to `/projects` and the list is visible again.
  5. **Action:** **Current page:** `/projects` — click **Open** again on the same project to re-enter the editor — confirm `/projects/[id]` loads.
  6. **Verify on-screen:** **Current page:** `/projects/[id]` — confirm editor UI is loaded and ready to preview/export.
- **Voiceover:**
  > “This is the creator workspace. Remix Packs become actual editable projects, not just NFTs or PDFs. You can open a project instantly, see the timeline, and start remixing. The point is speed: creators don’t want friction. Now we’ll stay in the editor and export a finished MP4—then we’ll upload it back into the feed to complete the full creator lifecycle.”

## 18. Timeline Editor + Export (CapCut‑Style Remix Production)
- **URL:** /projects/[id]
- **Shot:** Full editor view with timeline tracks, preview player, editing controls, and export/render progress UI.
- **Steps:**
  1. **Current page:** `/projects/[id]` — confirm the timeline editor is visible with a preview pane and an **Export** button.
  2. **Action:** **Current page:** `/projects/[id]` — drag a clip segment slightly on the timeline (a visible clip block) — confirm the clip block position changes on the timeline.
  3. **Action:** **Current page:** `/projects/[id]` — click **Preview** (or press the visible play control) — confirm the preview plays and the playhead moves on the timeline.
  4. **Action:** **Current page:** `/projects/[id]` — click **Export** — confirm an export modal/progress indicator appears.
  5. Click **Start Export** (or the primary export CTA) — wait for progress to reach 100% and an “Export complete” state.
  6. **Verify on-screen:** **Current page:** `/projects/[id]` — confirm an “Export complete” message and a **Download MP4** button/link is visible (and optionally the file downloads).
- **Voiceover:**
  > “Now we turn perks into content. I nudge a clip on the timeline, preview it, and export. The editor gives a clear render progress, then produces a downloadable MP4. This is where ClipYield becomes a real creator product: incentives unlock tools, and tools generate content that loops back into the feed. Next, we’ll upload this exported remix so the on-chain sponsorship flywheel drives actual distribution.”

## 19. Upload (Publish Remix Back to Feed)
- **URL:** /upload
- **Shot:** Upload page with video file selector, caption input, and a primary Publish/Post button; visible success state after upload.
- **Steps:**
  1. **Current page:** `/projects/[id]` — confirm “Export complete” and “Download MP4” are visible (or the file is downloaded).
  2. **Navigate:** **Current page:** `/projects/[id]` — click **Upload** in the top navigation → lands on `/upload` — confirm the heading “Upload” and a video upload panel is visible.
  3. **Action:** **Current page:** `/upload` — click **Select Video** (or **Choose File**) — confirm the OS file picker opens.
  4. **Enter values:**
     - Video file = `[FILE="clipyield_remix.mp4"]`
     - Caption = `[CAPTION="Boost Pass Remix — sponsored on Mantle Sepolia 🚀"]`
  5. Click **Publish** — wait for an “Uploaded” toast and redirect to `/`.
  6. **Verify on-screen:** **Current page:** `/` — confirm the newly uploaded clip appears in the feed with the caption text visible.
- **Voiceover:**
  > “This closes the loop: we publish the exported remix back into ClipYield. I select the file ‘clipyield_remix.mp4’ and caption it ‘Boost Pass Remix — sponsored on Mantle Sepolia 🚀’. After publishing, we’re back on the feed and the new post is live. Now I’ll show a technical proof endpoint that supports the finality UX you saw on receipts.”

## 20. Mantle Rollup Info API (Finality UX Proof)
- **URL:** /api/mantle/rollup-info
- **Shot:** Raw JSON response in the browser showing `{ ok, info }` fields that power receipt finality UI.
- **Steps:**
  1. **Current page:** `/` — confirm your new clip is visible in the feed.
  2. **Navigate:** **Current page:** `/` — open URL directly: `/api/mantle/rollup-info` → lands on `/api/mantle/rollup-info` — confirm a JSON response is visible.
  3. **Action:** **Current page:** `/api/mantle/rollup-info` — highlight the `ok` field — confirm it reads `true` (or a success value).
  4. **Action:** **Current page:** `/api/mantle/rollup-info` — scroll slightly — confirm `info` (or nested rollup fields) are visible.
  5. **Action:** **Current page:** `/api/mantle/rollup-info` — copy the full URL from the address bar — confirm it’s exactly `/api/mantle/rollup-info`.
  6. **Verify on-screen:** **Current page:** `/api/mantle/rollup-info` — confirm the API returns a valid JSON payload used by the receipt finality panel.
- **Voiceover:**
  > “This endpoint is a small but powerful UX detail: /api/mantle/rollup-info returns rollup status data so receipts can display L2 inclusion and finality in a user-friendly way. It’s a judge-friendly proof that we’re using Mantle’s network characteristics to improve the experience—not just deploying contracts. Now let’s wrap with the full journey and what we proved.”

## Final Wrap-Up
- **URL:** /profile/[id]
- **Shot:** Creator profile showing the uploaded remix post, follower state, and visible Boost/Sponsor CTAs; proof that the consumer and RealFi loops are connected.
- **Steps:**
  1. **Current page:** `/api/mantle/rollup-info` — confirm JSON is visible.
  2. **Verify final state:** Open URL directly: `/profile/[id]` — confirm the profile shows your latest remix post, “Following” state, and Boost/Sponsor actions.
- **Voiceover:**
  > “We proved a complete, production-grade loop: social feeds, follow graph, creator editing, and on-chain RealFi with KYC-gated vault deposits and sponsor receipts on Mantle Sepolia, plus leaderboards and Boost Pass perks to drive retention. This is a consumer app that makes yield and sponsorship feel native. Try it at [DEMO_URL].”
