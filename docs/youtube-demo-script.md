Project: ClipYield  
One-liner: A creator-first short‑video platform where sponsorships are tokenized as invoice receipts and protocol fee cash‑flows fund compliant, KYC‑gated yield vaults on Mantle Sepolia.

## 1. For You Feed (Consumer UX First)
- **URL:** /
- **Shot:** Vertical autoplay feed with “For You” selected, right-rail actions (Like/Comment/Share), and visible “Sponsor”/“Boost” CTAs on each clip card.
- **Steps:**
  1. **Current page:** New browser tab — confirm the tab is open and idle.
  2. **Navigate:** Open URL directly: `/` → lands on `/` — confirm “For You” is selected and a clip is autoplaying.
  3. **Action:** **Current page:** `/` — scroll one clip down — confirm the next clip autoplays and the creator handle changes.
  4. **Action:** **Current page:** `/` — click “❤ Like” on the right rail — confirm the icon toggles and the count increments.
  5. **Action:** **Current page:** `/` — pause on the clip CTA area — confirm “Sponsor” and “Boost” actions are visible on the clip UI.
  6. **Verify on-screen:** **Current page:** `/` — confirm autoplay, creator handle, and “For You” selected are visible.
- **Voiceover:**
  > “This is ClipYield’s consumer-first feed: fast autoplay clips with familiar social actions. The difference is that monetization isn’t off-platform—each clip can be boosted or sponsored as an on-chain cash-flow action on Mantle Sepolia. Next, we’ll open a clip detail to show comments and the financial actions anchored to real receipts.”

## 2. Post Detail + Comments (Social Proof Loop)
- **URL:** /post/[postId]/[userId]
- **Shot:** Clip detail view with comments panel, comment input, and visible “Sponsor” entry point.
- **Steps:**
  1. **Current page:** `/` — confirm a clip is visible.
  2. **Navigate:** **Current page:** `/` — click “💬 Comments” → lands on `/post/[postId]/[userId]` — confirm a “Comments” heading/panel is visible.
  3. **Action:** **Current page:** `/post/[postId]/[userId]` — click the input labeled “Add a comment…” — confirm cursor is active.
  4. **Enter values:**
     - Add a comment… = `[COMMENT_TEXT="Sponsoring this clip as an on-chain invoice 🔥"]`
  5. Click **Post** — wait for the comment to appear in the list.
  6. **Verify on-screen:** **Current page:** `/post/[postId]/[userId]` — confirm the new comment row appears with your identity.
- **Voiceover:**
  > “ClipYield keeps the social loop intact—comments and engagement drive discovery. I post ‘Sponsoring this clip as an on-chain invoice’ because that’s the RealFi story: sponsorships are not vague donations, they’re tokenized receipts with auditable terms. Next we’ll go to the creator profile and set up a boost vault.”

## 3. Creator Profile + Follow (Creator Surface)
- **URL:** /profile/[id]
- **Shot:** Creator header with Follow button, posts grid/list, and clear “Boost” CTA for the creator.
- **Steps:**
  1. **Current page:** `/post/[postId]/[userId]` — confirm comments are visible.
  2. **Navigate:** **Current page:** `/post/[postId]/[userId]` — click the creator handle → lands on `/profile/[id]` — confirm profile header loads with a “Follow” button.
  3. **Action:** **Current page:** `/profile/[id]` — click **Follow** — confirm it changes to “Following” (or “Unfollow”).
  4. **Action:** **Current page:** `/profile/[id]` — scroll the creator posts — confirm multiple posts render.
  5. **Action:** **Current page:** `/profile/[id]` — point at the “Boost” call-to-action — confirm Boost CTA is visible.
  6. **Verify on-screen:** **Current page:** `/profile/[id]` — confirm Following state and Boost CTA are visible.
- **Voiceover:**
  > “Profiles are where creators become investable businesses. I follow this creator so they show up in my social graph, and you can see the Boost action that routes value into a creator-specific vault. Next, I’ll prove the social feed works by switching to Following.”

## 4. Following Feed (Retention Engine)
- **URL:** /following
- **Shot:** Following feed with clips filtered to followed creators; “Following” selected.
- **Steps:**
  1. **Current page:** `/profile/[id]` — confirm “Following” state is visible on the button.
  2. **Navigate:** **Current page:** `/profile/[id]` — click “Following” in the nav → lands on `/following` — confirm the heading/tab shows “Following”.
  3. **Action:** **Current page:** `/following` — scroll one clip down — confirm next clip autoplays from a followed creator.
  4. **Action:** **Current page:** `/following` — click the creator handle on a clip — confirm it matches the creator you followed.
  5. **Action:** **Current page:** `/following` — click browser Back — confirm you return to `/following`.
  6. **Verify on-screen:** **Current page:** `/following` — confirm “Following” tab is active and filtered content is visible.
- **Voiceover:**
  > “This is the retention layer: a real social graph. That matters because RealFi mechanics only work if users come back daily. Next, we’ll connect with Privy embedded wallets and onboard to Mantle Sepolia so we can demonstrate KYC, custody, and compliant yield.”

## 5. Onboarding Wizard (Privy Wallet + Mantle Sepolia)
- **URL:** /start
- **Shot:** Onboarding wizard with steps for embedded wallet sign-in, chain readiness, and links to faucet/bridge.
- **Steps:**
  1. **Current page:** `/following` — confirm the Following feed is visible.
  2. **Navigate:** **Current page:** `/following` — click “Explore” → click “Start onboarding” → lands on `/start` — confirm a heading like “Start on Mantle Sepolia” is visible.
  3. **Action:** **Current page:** `/start` — click “Connect” (Privy) — confirm the Privy sign-in modal opens.
  4. **Action:** **Current page:** `/start` — complete Privy sign-in and create/connect an embedded wallet — confirm a wallet address like “0x…” appears as connected.
  5. **Action:** **Current page:** `/start` — click “Open Faucet” — confirm a new tab opens to the Mantle Sepolia faucet.
  6. **Verify on-screen:** **Current page:** `/start` — confirm Mantle Sepolia chain readiness is shown and wallet is connected.
- **Voiceover:**
  > “Onboarding is Web2.5: Privy embedded wallets remove key-management friction, then the wizard ensures you’re ready on Mantle Sepolia. This is crucial for judges—users can sign transactions securely without wrestling with wallet UX. Next we’ll run KYC, because we’re tokenizing invoices and distributing yield.”

## 6. KYC Start (Compliant Gate)
- **URL:** /kyc
- **Shot:** KYC landing page explaining compliance and showing a single “Start Verification” CTA.
- **Steps:**
  1. **Current page:** `/start` — confirm wallet is connected.
  2. **Navigate:** **Current page:** `/start` — click “Explore” → click “KYC verification” → lands on `/kyc` — confirm “KYC Verification” heading is visible.
  3. **Action:** **Current page:** `/kyc` — click “Start Verification” — confirm redirect to Persona hosted flow and Persona branding is visible.
  4. **Action:** **Current page:** Persona hosted flow — click “Continue” — confirm next step loads.
  5. **Action:** **Current page:** Persona hosted flow — complete the sandbox verification steps — confirm it reaches completion.
  6. **Verify on-screen:** **Current page:** Persona hosted flow — confirm the flow completes without exposing private keys.
- **Voiceover:**
  > “KYC is not decorative here—it’s the compliance layer for tokenized invoices and yield distribution. We launch a Persona hosted flow from /kyc and complete verification. The user doesn’t touch key material; Privy handles signing, Persona handles identity. Next we return to ClipYield and sync the verified status.”

## 7. KYC Completion + Sync (No Webhooks Needed)
- **URL:** /kyc/complete
- **Shot:** KYC completion screen with inquiry ID, status, wallet address, and a visible syncing/confirmed indicator.
- **Steps:**
  1. **Current page:** Persona hosted flow — confirm you are on the completed state.
  2. **Navigate:** **Current page:** Persona hosted flow — click the completion button → lands on `/kyc/complete` — confirm “KYC status” heading is visible.
  3. **Action:** **Current page:** `/kyc/complete` — click “Sync now” (or “Refresh Status”) — confirm a loading state appears.
  4. **Action:** **Current page:** `/kyc/complete` — wait for sync to complete — confirm the wallet shows as “Verified”.
  5. **Action:** **Current page:** `/kyc/complete` — click “Return to ClipYield” — confirm navigation returns to the app.
  6. **Verify on-screen:** **Current page:** `/kyc/complete` — confirm a “Verified” badge and the connected wallet address are shown.
- **Voiceover:**
  > “Instead of webhook dependency, we sync on demand from /kyc/complete. The UI shows the inquiry details, then we press Sync and the wallet flips to Verified. This is a demo-friendly, locally testable workflow that still writes verification into the on-chain registry. Next we’ll open the yield vault and show custody and balances.”

## 8. Yield Vault (Custody + Compliant Yield Distribution)
- **URL:** /yield
- **Shot:** Yield vault overview panels (TVL, shares), wallet status card, and action center (wrap/approve/deposit).
- **Steps:**
  1. **Current page:** `/kyc/complete` — confirm “Verified” is visible.
  2. **Navigate:** **Current page:** `/kyc/complete` — click “Explore” → click “Yield vault” → lands on `/yield` — confirm “ClipYield Vault” heading is visible.
  3. **Action:** **Current page:** `/yield` — confirm “KYC” shows “Verified” — confirm the verified badge is visible in the wallet status panel.
  4. **Action:** **Current page:** `/yield` — click “Wrap MNT to WMNT” — confirm a wallet signing prompt appears.
  5. **Action:** **Current page:** `/yield` — approve the transaction — confirm a “Transaction submitted” toast appears with a MantleScan link.
  6. **Verify on-screen:** **Current page:** `/yield` — confirm “WMNT available” updates to a non-zero number (or “WMNT balance” updates) after confirmation.
- **Voiceover:**
  > “This is the custody layer: a KYC-gated ERC‑4626 vault holding WMNT on Mantle Sepolia. We wrap MNT into WMNT, sign once, and the UI confirms on-chain submission with MantleScan proof. This vault is where compliant yield distribution happens—next we’ll boost a creator and then sponsor a clip to mint an invoice receipt.”

## 9. Creator Directory (Discovery for Cash-Flow Assets)
- **URL:** /creators
- **Shot:** Creator directory with suggested list and a clear “Boost” action per creator.
- **Steps:**
  1. **Current page:** `/yield` — confirm the vault UI is visible.
  2. **Navigate:** **Current page:** `/yield` — click “Explore” → click “Creators” → lands on `/creators` — confirm “Creators” heading is visible.
  3. **Action:** **Current page:** `/creators` — click a creator row labeled “@creator” — confirm it navigates to their profile.
  4. **Action:** **Current page:** `/profile/[id]` — click “Boost” — confirm it navigates to the creator boost vault page.
  5. **Action:** **Current page:** `/boost/[creatorId]` — pause on the vault panel — confirm creator identity is visible on the page.
  6. **Verify on-screen:** **Current page:** `/boost/[creatorId]` — confirm the Boost Vault UI is loaded for that creator.
- **Voiceover:**
  > “Creators are the destination for value. The directory makes discovery easy, and every creator has a boost vault—this is how users route funds into creator-specific custody. Next we’ll deposit into the boost vault, then sponsor a clip to tokenize the invoice and generate revenue-funded yield.”

## 10. Boost Vault (Creator-Directed Capital)
- **URL:** /boost/[creatorId]
- **Shot:** Boost vault UI with amount input, approval state, and deposit action.
- **Steps:**
  1. **Current page:** `/boost/[creatorId]` — confirm the creator handle and “Boost Vault” are visible.
  2. **Action:** **Current page:** `/boost/[creatorId]` — click the amount field labeled “Amount (WMNT)” — confirm cursor is active.
  3. **Enter values:**
     - Amount (WMNT) = `[BOOST_WMNT=0.05]`
  4. Click “Approve” (if shown) — wait for wallet prompt and “Approved” state.
  5. Click “Deposit” — wait for “Transaction submitted” toast with explorer link.
  6. **Verify on-screen:** **Current page:** `/boost/[creatorId]` — confirm your boost position/shares update and a tx link is visible.
- **Voiceover:**
  > “Boosting is creator-directed capital: you deposit WMNT into a creator-specific vault. It’s custody-first—assets are on-chain, and your position is tracked transparently. Now we’ll sponsor a specific clip, which mints a tokenized invoice receipt and funds yield through protocol revenue.”

## 11. Sponsor a Clip (Tokenized Invoice Creation)
- **URL:** /sponsor/[postId]
- **Shot:** Sponsorship page with clip preview, sponsorship breakdown panel, and “Confirm Sponsorship” CTA that mentions Invoice Receipt NFT.
- **Steps:**
  1. **Current page:** `/post/[postId]/[userId]` — confirm the clip and actions are visible.
  2. **Navigate:** **Current page:** `/post/[postId]/[userId]` — click “Sponsor” → lands on `/sponsor/[postId]` — confirm “Sponsor” heading and clip preview appear.
  3. **Action:** **Current page:** `/sponsor/[postId]` — click input labeled “Amount (WMNT)” — confirm cursor is active.
  4. **Enter values:**
     - Amount (WMNT) = `[SPONSOR_WMNT=0.10]`
  5. Click “Confirm Sponsorship” — wait for wallet prompt and “Transaction submitted” state.
  6. **Verify on-screen:** **Current page:** `/sponsor/[postId]` — confirm a success state shows “Invoice Receipt NFT minted” (token ID visible) or a “View Receipt” button appears.
- **Voiceover:**
  > “This is the RWA moment: sponsorship becomes a tokenized invoice. I sponsor with 0.10 WMNT, confirm the transaction, and the app mints an Invoice Receipt NFT that encodes the terms hash and cash-flow details. Next we open the campaign receipt page where the invoice token and transaction are auditable.”

## 12. Campaign Receipt (RWA Proof + Terms Hash)
- **URL:** /campaign/[campaignId]
- **Shot:** Campaign receipt with terms hash, tx status, MantleScan link, and Invoice Receipt NFT section (contract + token ID).
- **Steps:**
  1. **Current page:** `/sponsor/[postId]` — confirm sponsorship success state is visible.
  2. **Navigate:** **Current page:** `/sponsor/[postId]` — click “View Receipt” → lands on `/campaign/[campaignId]` — confirm “Campaign Receipt” heading is visible.
  3. **Action:** **Current page:** `/campaign/[campaignId]` — click “Copy Terms Hash” — wait for a “Copied” toast.
  4. **Action:** **Current page:** `/campaign/[campaignId]` — click “View Transaction on MantleScan” — confirm new tab opens to MantleScan tx.
  5. **Action:** **Current page:** `/campaign/[campaignId]` — click “View Invoice Receipt NFT” (or the NFT link) — confirm MantleScan opens on the NFT/token view.
  6. **Verify on-screen:** **Current page:** `/campaign/[campaignId]` — confirm terms hash, tx status, and invoice token ID are all visible.
- **Voiceover:**
  > “This receipt is the compliance-friendly proof: a terms hash, on-chain tx status, and an Invoice Receipt NFT that tokenizes the sponsorship invoice. Judges can click straight to MantleScan and verify everything. Next, we’ll show how those sponsorship fees create yield by flowing into the yield vault, and we’ll surface it in the Activity feed and leaderboard.”

## 13. Activity Feed (Auditable Ledger)
- **URL:** /activity
- **Shot:** Activity list with event rows (Boost deposit, Sponsorship invoice, Vault events) and MantleScan links.
- **Steps:**
  1. **Current page:** `/campaign/[campaignId]` — confirm the receipt is visible.
  2. **Navigate:** **Current page:** `/campaign/[campaignId]` — click “Explore” → click “Activity feed” → lands on `/activity` — confirm “Activity” heading and rows appear.
  3. **Action:** **Current page:** `/activity` — click “Next” in pagination — confirm rows update and page indicator changes.
  4. **Action:** **Current page:** `/activity` — click “View on MantleScan” on an invoice/sponsorship row — confirm MantleScan opens on the tx.
  5. **Action:** **Current page:** `/activity` — click “Previous” — confirm you return to the prior page of events.
  6. **Verify on-screen:** **Current page:** `/activity` — confirm event types include Sponsorship/Invoice and Boost/Vault actions.
- **Voiceover:**
  > “Activity is the transparent ledger: boost deposits, tokenized sponsorship invoices, and vault actions are all visible with explorer links. This is the RealFi credibility layer—nothing is hidden. Next we convert that verified activity into a leaderboard to drive incentives and repeat usage.”

## 14. Leaderboard (Incentives + Growth)
- **URL:** /leaderboard
- **Shot:** Ranked creators table with totals, and clickable rows to drill into profiles.
- **Steps:**
  1. **Current page:** `/activity` — confirm event list is visible.
  2. **Navigate:** **Current page:** `/activity` — click “Explore” → click “Leaderboard” → lands on `/leaderboard` — confirm “Leaderboard” heading and ranked rows appear.
  3. **Action:** **Current page:** `/leaderboard` — click the boosted creator row — confirm a detail view or profile navigation occurs.
  4. **Action:** **Current page:** `/profile/[id]` — confirm creator identity matches.
  5. **Action:** **Current page:** `/profile/[id]` — click Back — confirm return to `/leaderboard`.
  6. **Verify on-screen:** **Current page:** `/leaderboard` — confirm rankings reflect on-chain activity totals.
- **Voiceover:**
  > “Leaderboards turn financial actions into social status. Because rankings are computed from confirmed on-chain events, incentives are auditable. Next we’ll show Boost Pass publication and perks—the reward layer that turns cash-flow into creator tools.”

## 15. Admin Access Gate (Only Allowlisted Wallet)
- **URL:** /admin/kyc
- **Shot:** Attempted admin navigation showing “Access denied” (non-admin wallet), with a clear switch-wallet prompt.
- **Steps:**
  1. **Current page:** `/leaderboard` — confirm leaderboard is visible.
  2. **Navigate:** **Current page:** `/leaderboard` — open URL directly: `/admin/kyc` → lands on `/admin/kyc` — confirm an “Access denied” or “Not authorized” message appears.
  3. **Action:** **Current page:** `/admin/kyc` — click “Switch wallet” (or “Sign out”) — confirm Privy account modal opens.
  4. **Action:** **Current page:** Privy modal — select the allowlisted admin wallet account — confirm connected wallet address changes.
  5. **Action:** **Current page:** `/admin/kyc` — click “Retry” (or reload page) — confirm the admin console loads.
  6. **Verify on-screen:** **Current page:** `/admin/kyc` — confirm “KYC Admin” heading and table of records appear.
- **Voiceover:**
  > “Admin routes are gated: if you’re not on the allowlist, you see an explicit access-denied screen instead of a silent failure. We switch to the admin wallet and immediately unlock the console. This keeps UX clean for normal users and secure for operations. Next we’ll publish a Boost Pass epoch.”

## 16. Admin Boost Pass (Publish On-Chain Incentive Epoch)
- **URL:** /admin/boost-pass
- **Shot:** Admin Boost Pass screen showing snapshot rows and a “Publish Epoch” action.
- **Steps:**
  1. **Current page:** `/admin/kyc` — confirm KYC table is visible.
  2. **Navigate:** **Current page:** `/admin/kyc` — click “Explore” → click “Boost Pass admin” → lands on `/admin/boost-pass` — confirm “Boost Pass Admin” heading is visible.
  3. **Action:** **Current page:** `/admin/boost-pass` — select latest snapshot row — confirm it highlights/expands.
  4. **Action:** **Current page:** `/admin/boost-pass` — click “Publish Epoch” — confirm wallet prompt appears.
  5. Click “Confirm” in wallet — wait for “Epoch published” toast/state.
  6. **Verify on-screen:** **Current page:** `/admin/boost-pass` — confirm epoch status updates and a tx hash link is visible.
- **Voiceover:**
  > “Now incentives become real: we publish a Boost Pass epoch on-chain from leaderboard snapshots. The tx hash is visible, so eligibility is verifiable. Next we switch back to a normal user wallet and claim perks—downloading a remix pack tied to these on-chain incentives.”

## 17. Boost Pass Perks (Remix Pack Unlock)
- **URL:** /perks/boost-pass
- **Shot:** Perks page showing ownership status and “Download Remix Pack” + “Import to Projects”.
- **Steps:**
  1. **Current page:** `/admin/boost-pass` — confirm epoch is published.
  2. **Navigate:** **Current page:** `/admin/boost-pass` — click “Sign out” (or “Switch wallet”) — confirm wallet returns to a normal user account.
  3. **Navigate:** **Current page:** Any app page — click “Explore” → click “Boost Pass perks” → lands on `/perks/boost-pass` — confirm Boost Pass heading and ownership status appear.
  4. **Action:** **Current page:** `/perks/boost-pass` — click “Download Remix Pack” — confirm browser download or “Download started” toast.
  5. Click “Import to Projects” — wait for redirect — confirm you land on `/projects`.
  6. **Verify on-screen:** **Current page:** `/projects` — confirm a new project row appears or “Remix Pack imported” toast is shown.
- **Voiceover:**
  > “Perks complete the loop: on-chain incentives unlock creator tools. We download a Remix Pack and import it into the editor in one click. Next we’ll open the project, generate or edit content, export, and upload back into the feed—so the RealFi layer drives real creation.”

## 18. Settings (Wallet + Playback + AI BYOK)
- **URL:** /settings
- **Shot:** Settings page showing wallet status, playback preferences, and AI BYOK key controls.
- **Steps:**
  1. **Current page:** `/projects` — confirm project list is visible.
  2. **Navigate:** **Current page:** `/projects` — click “Explore” → click “Settings” → lands on `/settings` — confirm “Settings” heading is visible.
  3. **Action:** **Current page:** `/settings` — confirm wallet status section shows connected address.
  4. **Action:** **Current page:** `/settings` — toggle a playback preference (e.g., “Autoplay”) — confirm the toggle state changes.
  5. **Action:** **Current page:** `/settings` — locate AI BYOK key section — confirm an input or “Set key” control is visible.
  6. **Verify on-screen:** **Current page:** `/settings` — confirm settings sections for wallet, playback, and AI keys are visible.
- **Voiceover:**
  > “Settings keeps the UX polished: wallet state, playback controls, and optional AI BYOK keys for creator tooling. This shows ClipYield is more than a contract demo—it’s a product. Next we’ll jump into the editor and export a remix.”

## 19. Projects List (Creator Workspace)
- **URL:** /projects
- **Shot:** Projects list with an imported Remix Pack project row and Open action.
- **Steps:**
  1. **Current page:** `/settings` — confirm settings heading is visible.
  2. **Navigate:** **Current page:** `/settings` — click “Projects” in the sidebar/nav → lands on `/projects` — confirm project list heading appears.
  3. **Action:** **Current page:** `/projects` — click “Open” on “Boost Pass Remix Pack” — confirm navigation to `/projects/[id]`.
  4. **Action:** **Current page:** `/projects/[id]` — pause on the editor UI — confirm timeline and preview are visible.
  5. **Action:** **Current page:** `/projects/[id]` — click “Back to Projects” — confirm return to `/projects`.
  6. **Verify on-screen:** **Current page:** `/projects` — confirm the imported project row remains visible.
- **Voiceover:**
  > “This is the creator workspace: Remix Packs turn into editable projects, not just collectibles. You open instantly, edit, and export. Now we’ll stay in the editor, render a final MP4, and upload it to complete the on-chain-to-content loop.”

## 20. Timeline Editor + Export (Production Step)
- **URL:** /projects/[id]
- **Shot:** Editor with timeline, preview playback, and export progress UI.
- **Steps:**
  1. **Current page:** `/projects` — confirm project list is visible.
  2. **Navigate:** **Current page:** `/projects` — click “Open” on the remix project → lands on `/projects/[id]` — confirm timeline editor loads.
  3. **Action:** **Current page:** `/projects/[id]` — drag a clip block slightly — confirm clip block position changes.
  4. **Action:** **Current page:** `/projects/[id]` — click “Preview” — confirm playback starts and playhead moves.
  5. Click “Export” → click “Start Export” — wait for “Export complete” state.
  6. **Verify on-screen:** **Current page:** `/projects/[id]` — confirm “Export complete” and “Download MP4” are visible.
- **Voiceover:**
  > “Now we convert incentives into output. We edit the timeline, preview, then export with a clear render progress and a downloadable MP4. This is how ClipYield turns on-chain actions into real creator production. Next we upload the finished remix back into the feed.”

## 21. Upload (Publish Remix Back to Feed)
- **URL:** /upload
- **Shot:** Upload page with file picker, caption input, and Publish button; success redirect to feed.
- **Steps:**
  1. **Current page:** `/projects/[id]` — confirm “Export complete” is visible.
  2. **Navigate:** **Current page:** `/projects/[id]` — click “Upload” in top nav → lands on `/upload` — confirm “Upload” heading is visible.
  3. **Action:** **Current page:** `/upload` — click “Choose File” — confirm OS file picker opens.
  4. **Enter values:**
     - Video file = `[FILE="clipyield_remix.mp4"]`
     - Caption = `[CAPTION="Tokenized invoice sponsorship → Remix Pack → Exported edit 🚀"]`
  5. Click “Publish” — wait for “Uploaded” toast and redirect to `/`.
  6. **Verify on-screen:** **Current page:** `/` — confirm the new clip appears in the feed with the caption visible.
- **Voiceover:**
  > “We close the loop by uploading the exported remix: ‘Tokenized invoice sponsorship → Remix Pack → Exported edit’. After publishing, the new post is live in the feed. Now we’ll wrap up with what we proved for RealFi: tokenized invoices, KYC gating, custody, and revenue-funded yield.”

## Final Wrap-Up
- **URL:** /campaign/[campaignId]
- **Shot:** Campaign receipt showing terms hash, MantleScan tx link, and Invoice Receipt NFT token ID + contract.
- **Steps:**
  1. **Current page:** `/` — confirm the newly uploaded clip is visible.
  2. **Verify final state:** Open URL directly: `/campaign/[campaignId]` — confirm the receipt shows terms hash, tx status, and the Invoice Receipt NFT details.
- **Voiceover:**
  > “We proved an end-to-end RealFi product on Mantle Sepolia: consumer video UX, Privy wallet onboarding, Persona KYC, custody via ERC‑4626 vaults, sponsorships tokenized as invoice receipt NFTs, and compliant yield funded by real protocol cash-flow. It’s auditable, demoable, and user-friendly. Try it at [DEMO_URL].”
