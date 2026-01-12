Project: ClipYield  
One-liner: A creator-first short-video platform where sponsorships are tokenized as invoice receipts and protocol fee cash-flows fund compliant, KYC-gated yield vaults on Mantle Sepolia.

## 1. For You Feed (Consumer UX First)
- **URL:** /
- **Shot:** Vertical autoplay feed with “For You” selected, right-rail actions (Like/Comment/Share), and visible “Sponsor”/“Boost” CTAs on each clip card.
- **Steps:**
  1. **Current page:** New browser tab, confirm the tab is open and idle.
  2. **Navigate:** Open URL directly: `/` → lands on `/`, confirm “For You” is selected and a clip is autoplaying.
  3. **Action:** **Current page:** `/`, scroll one clip down, confirm the next clip autoplays and the creator handle changes.
  4. **Action:** **Current page:** `/`, click “❤ Like” on the right rail, confirm the icon toggles and the count increments.
  5. **Action:** **Current page:** `/`, pause on the clip CTA area, confirm “Sponsor” and “Boost” actions are visible on the clip UI.
  6. **Verify on-screen:** **Current page:** `/`, confirm autoplay, creator handle, and “For You” selected are visible.
- **Voiceover:**
  > "The first step is connecting a Privy embedded wallet from the nav so on-chain actions are ready. Then you're in ClipYield's consumer-first feed. Each clip can be boosted or sponsored as an on-chain cash-flow action on Mantle Sepolia."

## 2. Post Detail + Comments (Social Proof Loop)
- **URL:** /post/[postId]/[userId]
- **Shot:** Clip detail view with comments panel, comment input, and visible “Sponsor” entry point.
- **Steps:**
  1. **Current page:** `/`, confirm a clip is visible.
  2. **Navigate:** **Current page:** `/`, click “💬 Comments” → lands on `/post/[postId]/[userId]`, confirm a “Comments” heading/panel is visible.
  3. **Action:** **Current page:** `/post/[postId]/[userId]`, click the input labeled “Add a comment”, confirm cursor is active.
  4. **Enter values:**
     - Add a comment = `[COMMENT_TEXT="Sponsoring this clip as an on-chain invoice 🔥"]`
  5. Click **Post**, wait for the comment to appear in the list.
  6. **Verify on-screen:** **Current page:** `/post/[postId]/[userId]`, confirm the new comment row appears with your identity.
- **Voiceover:**
  > “I comment ‘Sponsoring this clip as an on-chain invoice’ because that’s the RealFi story: sponsorships are not vague donations, they’re tokenized receipts with auditable terms.”

## 3. Creator Profile + Following Feed (Creator Surface + Retention)
- **URL:** /profile/[id] → /following
- **Shot:** Creator header with Follow button, posts grid/list, Boost CTA, and a Following feed filtered to followed creators with “Following” selected.
- **Steps:**
  1. **Current page:** `/post/[postId]/[userId]`, confirm comments are visible.
  2. **Navigate:** **Current page:** `/post/[postId]/[userId]`, click the creator handle → lands on `/profile/[id]`, confirm profile header loads with a “Follow” button.
  3. **Action:** **Current page:** `/profile/[id]`, click **Follow**, confirm it changes to “Following” (or “Unfollow”).
  4. **Action:** **Current page:** `/profile/[id]`, scroll the creator posts and point at the “Boost” call-to-action, confirm multiple posts render and the Boost CTA is visible.
  5. **Navigate:** **Current page:** `/profile/[id]`, click “Following” in the nav → lands on `/following`, confirm the heading/tab shows “Following”.
  6. **Action:** **Current page:** `/following`, scroll one clip down, confirm next clip autoplays from a followed creator.
  7. **Action:** **Current page:** `/following`, click the creator handle on a clip, confirm it matches the creator you followed.
  8. **Action:** **Current page:** `/following`, click browser Back, confirm you return to `/following`.
  9. **Verify on-screen:** **Current page:** `/following`, confirm “Following” tab is active and filtered content is visible.
- **Voiceover:**
  > “I jump from a post to the creator profile, follow them, and then verify their clips show up in the Following feed.”

## 4. Onboarding Wizard (Privy Wallet + Mantle Sepolia)
- **URL:** /start
- **Shot:** Onboarding wizard with steps for embedded wallet sign-in, chain readiness, and links to faucet/bridge.
- **Steps:**
  1. **Current page:** `/following`, confirm the Following feed is visible.
  2. **Navigate:** **Current page:** `/following`, click “Explore” → click “Start onboarding” → lands on `/start`, confirm a heading like “Start on Mantle Sepolia” is visible.
  3. **Action:** **Current page:** `/start`, click “Connect” (Privy), confirm the Privy sign-in modal opens.
  4. **Action:** **Current page:** `/start`, complete Privy sign-in and create/connect an embedded wallet, confirm a wallet address like “0x1234” appears as connected.
  5. **Action:** **Current page:** `/start`, click “Open Faucet”, confirm a new tab opens to the Mantle Sepolia faucet.
  6. **Verify on-screen:** **Current page:** `/start`, confirm Mantle Sepolia chain readiness is shown and wallet is connected.
- **Voiceover:**
  > “Onboarding is Web2.5: Privy embedded wallets remove key-management friction, then the wizard ensures you’re ready on Mantle Sepolia.”

## 5. KYC Flow + Sync (Compliant Gate)
- **URL:** /kyc → /kyc/complete
- **Shot:** KYC landing page with a “Start Verification” CTA, Persona hosted flow, and completion screen with inquiry ID, status, wallet address, and sync indicator.
- **Steps:**
  1. **Current page:** `/start`, confirm wallet is connected.
  2. **Navigate:** **Current page:** `/start`, click “Go to yield vault” → lands on `/yield`, confirm a KYC required message and “Start KYC” button are visible.
  3. **Action:** **Current page:** `/yield`, click “Start KYC” → lands on `/kyc`, confirm “KYC Verification” heading is visible.
  4. **Action:** **Current page:** `/kyc`, click “Start Verification”, confirm redirect to Persona hosted flow and Persona branding is visible.
  5. **Action:** **Current page:** Persona hosted flow, click “Continue”, confirm next step loads.
  6. **Action:** **Current page:** Persona hosted flow, complete the sandbox verification steps, confirm it reaches completion.
  7. **Navigate:** **Current page:** Persona hosted flow, click the completion button → lands on `/kyc/complete`, confirm “KYC status” heading is visible.
  8. **Action:** **Current page:** `/kyc/complete`, click “Sync now” (or “Refresh Status”), confirm a loading state appears.
  9. **Verify on-screen:** **Current page:** `/kyc/complete`, confirm a “Verified” badge and the connected wallet address are shown.
- **Voiceover:**
  > “From onboarding we open the yield vault, see the KYC required gate, and use Start KYC to begin verification. KYC is required because the yield vault is funded by real world cash flows from tokenized sponsorship invoices, and compliant custody and yield access depend on verified identity. The flow redirects to /kyc and then to Persona to verify identity, then we sync on /kyc/complete so the wallet flips to Verified.”

## 6. Yield Vault (Custody + Real-Time Yield)
- **URL:** /yield
- **Shot:** Yield vault overview panels (TVL, shares), wallet status card, and the Yield Engine panel showing streaming yield + sync.
- **Steps:**
  1. **Current page:** `/kyc/complete`, confirm “Verified” is visible.
  2. **Navigate:** **Current page:** `/kyc/complete`, click “Explore” → click “Yield vault” → lands on `/yield`, confirm “Yield vault” heading is visible.
  3. **Action:** **Current page:** `/yield`, confirm “KYC” shows “Verified”, confirm the verified badge is visible in the wallet status panel.
  4. **Action:** **Current page:** `/yield`, confirm the “Yield engine” panel shows “Streaming now (est.)”.
  5. **Action:** **Current page:** `/yield`, click “Wrap MNT to WMNT”, confirm a wallet signing prompt appears, approve the transaction.
  6. **Action:** **Current page:** `/yield`, in the action center click “Approve” (if required), confirm approval state shows.
  7. **Action:** **Current page:** `/yield`, click “Deposit”, confirm a wallet prompt appears and a success toast or updated shares render.
  8. **Action:** **Current page:** `/yield`, click “Withdraw”, confirm a wallet prompt appears and the share balance updates.
  9. **Verify on-screen:** **Current page:** `/yield`, click “Sync yield on-chain”, confirm a MantleScan tx link appears and the pending yield resets or share price updates.
- **Voiceover:**
  > “This is the custody layer: a KYC-gated ERC-4626 vault holding WMNT on Mantle Sepolia. In the action center we wrap MNT, approve spending, deposit into the vault, and withdraw to show the full lifecycle. The Yield Engine shows real-time streaming yield on testnet, and we can sync it on-chain to lift share value. In production, this simulator is replaced by audited yield strategies and protocol-fee donations.”

## 7. Creator Directory + Boost Vault (Discovery to Capital)
- **URL:** /creators → /boost/[creatorId]
- **Shot:** Creator directory with Boost actions, then the boost vault UI with approval and deposit flow.
- **Steps:**
  1. **Current page:** `/yield`, confirm the vault UI is visible.
  2. **Navigate:** **Current page:** `/yield`, click “Explore” → click “Creators” → lands on `/creators`, confirm “Creators” heading is visible.
  3. **Action:** **Current page:** `/creators`, click a creator row labeled “@creator”, confirm it navigates to their profile.
  4. **Action:** **Current page:** `/profile/[id]`, click “Boost”, confirm it navigates to the creator boost vault page.
  5. **Action:** **Current page:** `/boost/[creatorId]`, click the amount field labeled “Amount (WMNT)”, confirm cursor is active.
  6. **Enter values:**
     - Amount (WMNT) = `[BOOST_WMNT=5]`
  7. **Action:** **Current page:** `/boost/[creatorId]`, click “Approve” (if shown), wait for wallet prompt and “Approved” state.
  8. **Action:** **Current page:** `/boost/[creatorId]`, click “Deposit”, wait for “Transaction submitted” toast with explorer link.
  9. **Verify on-screen:** **Current page:** `/boost/[creatorId]`, confirm your boost position updates and a tx link is visible.
- **Voiceover:**
  > “Creators are the destination for value. The directory makes discovery easy, then we enter a creator boost vault, approve, and deposit WMNT so custody and positions are on-chain.”

## 8. Sponsor a Clip (Tokenized Invoice Creation)
- **URL:** /sponsor/[postId]
- **Shot:** Sponsorship page with clip preview, sponsorship breakdown panel, and “Confirm Sponsorship” CTA that mentions Invoice Receipt NFT.
- **Steps:**
  1. **Current page:** `/boost/[creatorId]`, confirm the Boost Vault UI is visible.
  2. **Navigate:** **Current page:** `/boost/[creatorId]`, click “Explore” → click “Feed” → lands on `/` → click a clip → lands on `/post/[postId]/[userId]`, confirm the clip and actions are visible.
  3. **Navigate:** **Current page:** `/post/[postId]/[userId]`, click “Sponsor” → lands on `/sponsor/[postId]`, confirm “Sponsor” heading and clip preview appear.
  4. **Action:** **Current page:** `/sponsor/[postId]`, note that inputs live in “Campaign terms” and “Sponsor with invoice receipts”. The “Sponsor details”, “Sponsorship breakdown”, “Wallet balances”, and “Sponsor perks” cards are read only.
  5. **Action:** **Current page:** `/sponsor/[postId]`, in “Campaign terms” fill Sponsor name, Objective, Deliverables, Start date, End date.
  6. **Enter values:**
     - Sponsor name = `[SPONSOR_NAME=Mantle Creators Fund]`
     - Objective = `[SPONSOR_OBJECTIVE=Launch week push for the remix challenge]`
     - Deliverables (one per line)
       - `1x 15s clip featuring the campaign`
       - `1x caption + link in bio`
       - `1x behind the scenes remix`
     - Start date = `[SPONSOR_START_DATE=2026-01-12]`
     - End date = `[SPONSOR_END_DATE=2026-01-19]`
  7. **Action:** **Current page:** `/sponsor/[postId]`, in “Sponsor with invoice receipts” click input labeled “Amount (WMNT)”, confirm cursor is active.
  8. **Enter values:**
     - Amount (WMNT) = `[SPONSOR_WMNT=1]`
  9. **Action:** **Current page:** `/sponsor/[postId]`, click “Wrap MNT to WMNT” if needed.
  10. **Action:** **Current page:** `/sponsor/[postId]`, click “Approve sponsor hub” if shown, wait for “Approved” state.
  11. **Action:** **Current page:** `/sponsor/[postId]`, click “Sponsor clip”, wait for wallet prompt and “Transaction submitted” state.
  12. **Verify on-screen:** **Current page:** `/sponsor/[postId]`, confirm a success state shows “Invoice Receipt NFT minted” (token ID visible) or a “View Receipt” button appears.
- **Voiceover:**
  > “This is the Real finance moment: Sponsorship becomes a tokenized invoice. We fill in campaign terms, set the WMNT amount in Sponsor with invoice receipts, then sponsor the clip. The app mints an Invoice Receipt NFT with the terms hash and receipt details.”

## 9. Activity Feed (Auditable Ledger)
- **URL:** /activity
- **Shot:** Activity list with event rows (Boost deposit, Sponsorship invoice, Vault events) and MantleScan links.
- **Steps:**
  1. **Current page:** `/campaign/[campaignId]`, confirm the receipt is visible.
  2. **Navigate:** **Current page:** `/campaign/[campaignId]`, click “Explore” → click “Activity feed” → lands on `/activity`, confirm “Activity” heading and rows appear.
  3. **Action:** **Current page:** `/activity`, click “Next” in pagination, confirm rows update and page indicator changes.
  4. **Action:** **Current page:** `/activity`, click “View on MantleScan” on an invoice/sponsorship row, confirm MantleScan opens on the tx.
  5. **Action:** **Current page:** `/activity`, click “Previous”, confirm you return to the prior page of events.
  6. **Verify on-screen:** **Current page:** `/activity`, confirm event types include Sponsorship/Invoice and Boost/Vault actions.
- **Voiceover:**
  > “Activity is the transparent ledger: boost deposits, tokenized sponsorship invoices, and vault actions are all visible with explorer links. This is the RealFi credibility layer, nothing is hidden.”

## 10. Projects + Editor + Export (Creator Workspace)
- **URL:** /projects
- **Shot:** Projects list with a new project flow, then the editor with timeline, preview, and export UI.
- **Steps:**
  1. **Current page:** `/settings`, confirm settings heading is visible.
  2. **Navigate:** **Current page:** `/settings`, click "Projects" in the sidebar/nav → lands on `/projects`, confirm project list heading appears.
  3. **Action:** **Current page:** `/projects`, click "New project", confirm the create dialog appears.
  4. **Enter values:**
     - Project name = `[PROJECT_NAME="Creator draft"]`
  5. **Action:** **Current page:** `/projects`, click "Create", confirm the new project row appears.
  6. **Action:** **Current page:** `/projects`, click "Open" on "Creator draft", confirm navigation to `/projects/[id]`.
  7. **Action:** **Current page:** `/projects/[id]`, drag a clip block slightly, confirm clip block position changes.
  8. **Action:** **Current page:** `/projects/[id]`, click "Preview", confirm playback starts and playhead moves.
  9. **Action:** **Current page:** `/projects/[id]`, click "Export" then "Start Export", wait for "Export complete" state.
  10. **Verify on-screen:** **Current page:** `/projects/[id]`, confirm "Export complete" and "Download MP4" are visible.
- **Voiceover:**
  > "This is the creator workspace. We create a new draft called Creator draft, open it in the editor, then preview and export a finished MP4 with clear progress feedback."

## 11. Upload (Publish Remix Back to Feed)
- **URL:** /upload
- **Shot:** Upload page with file picker, caption input, and Publish button; success redirect to feed.
- **Steps:**
  1. **Current page:** `/projects/[id]`, confirm “Export complete” is visible.
  2. **Navigate:** **Current page:** `/projects/[id]`, click “Upload” in top nav → lands on `/upload`, confirm “Upload” heading is visible.
  3. **Action:** **Current page:** `/upload`, click “Choose File”, confirm OS file picker opens.
  4. **Enter values:**
     - Video file = `[FILE="clipyield_remix.mp4"]`
     - Caption = `[CAPTION="Tokenized invoice sponsorship → Remix Pack → Exported edit 🚀"]`
  5. Click “Publish”, wait for “Uploaded” toast and redirect to `/`.
  6. **Verify on-screen:** **Current page:** `/`, confirm the new clip appears in the feed with the caption visible.
- **Voiceover:**
  > “We close the loop by uploading the exported remix: ‘Tokenized invoice sponsorship → Remix Pack → Exported edit’. After publishing, the new post is live in the feed.”
