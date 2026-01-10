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
  5. **Action:** **Current page:** `/` — pause on the clip action area — confirm a visible “Sponsor” callout is present on the clip UI.
  6. **Verify on-screen:** **Current page:** `/` — confirm you can see (1) an autoplaying clip, (2) a creator handle, and (3) “For You” selected in the top nav.
- **Voiceover:**
  > “This is ClipYield’s ‘For You’ feed: a TikTok-style short-video experience, but built around real on-chain value. Every clip is built for engagement, and every clip is sponsorable with real transactions on Mantle Sepolia. Now I’ll connect with Privy so we can comment, follow, and start signing transactions without exposing private keys.”

## 2. Privy Embedded Wallet Connect (Seamless Wallet UX)
- **URL:** /
- **Shot:** Same feed, with a header “Connect wallet” button; then a Privy modal appears for login/connection; finally a connected wallet indicator appears.
- **Steps:**
  1. **Current page:** `/` — confirm the feed is visible and autoplaying.
  2. **Navigate:** **Current page:** `/` — click “Connect wallet” in the header → confirm a Privy connection/login modal opens.
  3. **Action:** **Current page:** Privy modal — select “Email” (or your preferred login method) — confirm the modal advances to an email step.
  4. **(Only if needed) Enter values:**
     - Email = `[EMAIL="demo@clipyield.xyz"]`
  5. Click “Continue” — wait for the modal to complete — confirm the header shows a connected state (e.g., a wallet address like “0x…”) and the modal closes.
  6. **Verify on-screen:** **Current page:** `/` — confirm the “Connect wallet” button is replaced by a connected wallet indicator in the header.
- **Voiceover:**
  > “Here’s the core sponsor-wallet requirement: we connect with Privy using an embedded wallet flow. I sign in with demo@clipyield.xyz, and ClipYield gives me a wallet connection that’s ready to sign transactions—without ever showing me a private key. Now that I’m connected, I’ll open a clip and show the social engagement loop.”

## 3. Post Detail + Comments (Engagement Loop)
- **URL:** /post/[postId]/[userId]
- **Shot:** Post detail view with the clip, a comments panel/list, and engagement actions; a visible “Sponsor” entry point for the clip.
- **Steps:**
  1. **Current page:** `/` — confirm “For You” is selected and a clip is visible.
  2. **Navigate:** **Current page:** `/` — click the “💬 Comments” button on the right rail → lands on `/post/[postId]/[userId]` — confirm a “Comments” heading/panel is visible next to the clip.
  3. **Action:** **Current page:** `/post/[postId]/[userId]` — click the comment input labeled “Add a comment…” — confirm the cursor is active in the input.
  4. **(Only if needed) Enter values:**
     - Add a comment… = `[COMMENT_TEXT="Just sponsored this clip — love the remix perks 🚀"]`
  5. Click “Post” — wait for the new comment to appear in the list.
  6. **Verify on-screen:** **Current page:** `/post/[postId]/[userId]` — confirm your comment appears as a new list item with your identity.
- **Voiceover:**
  > “On the post detail page, ClipYield keeps the UX familiar: comments, reactions, and discovery. I add ‘Just sponsored this clip — love the remix perks 🚀’ and we immediately see it appear. Next, I’ll go to the creator profile so we can follow them and prove the social graph.”

## 4. Creator Profile + Follow (Creator Surface)
- **URL:** /profile/[id]
- **Shot:** Creator profile header (avatar/handle), Follow button, creator posts grid/list, and a visible “Boost” or “Sponsor” CTA.
- **Steps:**
  1. **Current page:** `/post/[postId]/[userId]` — confirm the comments panel and clip are visible.
  2. **Navigate:** **Current page:** `/post/[postId]/[userId]` — click the creator handle (e.g., “@creator”) → lands on `/profile/[id]` — confirm the profile header is visible with a “Follow” button.
  3. **Action:** **Current page:** `/profile/[id]` — click “Follow” — confirm the button label changes to “Following”.
  4. **Action:** **Current page:** `/profile/[id]` — scroll to the creator’s posts list/grid — confirm multiple posts are visible.
  5. **Action:** **Current page:** `/profile/[id]` — point out the creator CTA (“Boost” / “Sponsor”) — confirm it’s visible as a button or panel.
  6. **Verify on-screen:** **Current page:** `/profile/[id]` — confirm you see “Following” plus the creator’s posts and a Boost/Sponsor entry point.
- **Voiceover:**
  > “This is where creators become businesses. I follow the creator so they appear in my Following feed, and you can see the monetization CTAs like Boost and Sponsor. Now I’ll switch to the Following feed to prove the social graph works end-to-end.”

## 5. Following Feed (Social Graph Retention)
- **URL:** /following
- **Shot:** “Following” feed view with clips only from followed creators; visible “Following” tab selected.
- **Steps:**
  1. **Current page:** `/profile/[id]` — confirm the button shows “Following”.
  2. **Navigate:** **Current page:** `/profile/[id]` — click “Following” in the top navigation → lands on `/following` — confirm the page heading shows “Following”.
  3. **Action:** **Current page:** `/following` — scroll one clip down — confirm the next clip loads/autoplays and the creator handle matches a followed creator.
  4. **Action:** **Current page:** `/following` — click the creator handle on a clip — confirm it navigates to `/profile/[id]` with the same creator identity.
  5. **Navigate:** **Current page:** `/profile/[id]` — click the browser Back button → lands on `/following` — confirm “Following” remains selected.
  6. **Verify on-screen:** **Current page:** `/following` — confirm the feed is filtered to followed creators.
- **Voiceover:**
  > “This Following feed is the retention engine. It’s not random content—it’s your creators. That matters because ClipYield’s incentives—boosts, sponsorships, and perks—work best when users return to creators they care about. Next, we’ll onboard to Mantle Sepolia so we can demonstrate real transaction signing with Privy.”

## 6. Mantle Sepolia Onboarding Wizard (Network Readiness)
- **URL:** /start
- **Shot:** Mantle onboarding wizard showing connected wallet status, Mantle Sepolia readiness, and a faucet link step for test funds.
- **Steps:**
  1. **Current page:** `/following` — confirm the feed is visible and your wallet is connected in the header.
  2. **Navigate:** Open URL directly: `/start` → lands on `/start` — confirm a heading like “Start on Mantle Sepolia” and a step list is visible.
  3. **Action:** **Current page:** `/start` — click “Open Mantle faucet” — confirm a new tab opens to `https://faucet.sepolia.mantle.xyz/`.
  4. **Action:** **Current page:** Faucet tab — confirm the page shows the Mantle Sepolia faucet UI.
  5. **Navigate:** **Current page:** Faucet tab — close the faucet tab and return to the `/start` tab — confirm the onboarding wizard is still visible.
  6. **Verify on-screen:** **Current page:** `/start` — confirm the wizard shows “Wallet connected” and Mantle Sepolia readiness indicators.
- **Voiceover:**
  > “This onboarding is designed to be judge-friendly and user-friendly. We’re connected with Privy, and the app walks us to Mantle Sepolia’s official faucet so we can transact with real test funds. Now we’ll do the compliance gate—KYC—so yield and sponsorship interactions can be permissioned properly.”

## 7. KYC Start (Persona Hosted Flow)
- **URL:** /kyc
- **Shot:** KYC landing page with status + a single “Start Verification” CTA; then Persona hosted flow branding appears.
- **Steps:**
  1. **Current page:** `/start` — confirm the onboarding wizard is visible.
  2. **Navigate:** Open URL directly: `/kyc` → lands on `/kyc` — confirm a heading like “KYC Verification” and a “Start Verification” button is visible.
  3. **Action:** **Current page:** `/kyc` — click “Start Verification” — confirm you are redirected to a Persona hosted flow and see Persona branding.
  4. **Action:** **Current page:** Persona hosted flow — pause on the first screen — confirm an “Identity Verification” label is visible.
  5. **Action:** **Current page:** Persona hosted flow — click “Continue” — confirm Persona advances to the next step.
  6. **Verify on-screen:** **Current page:** Persona hosted flow — confirm you’re inside an active verification flow.
- **Voiceover:**
  > “This is ClipYield’s compliance gate. We start verification from /kyc and launch a Persona hosted KYC flow. This keeps the user experience clean while still enabling permissioned yield mechanics. Once KYC is complete, we return to ClipYield and show the verified state.”

## 8. KYC Completion (Verified Status)
- **URL:** /kyc/complete
- **Shot:** KYC completion page with a visible status badge like “Verified” and a CTA to continue into vault interactions.
- **Steps:**
  1. **Current page:** Persona hosted flow — confirm you’re at the completion/review step.
  2. **Navigate:** **Current page:** Persona hosted flow — click the final completion button (e.g., “Finish”) → redirects to `/kyc/complete` — confirm a status badge like “KYC Verified” is visible.
  3. **Action:** **Current page:** `/kyc/complete` — click “Continue to Yield” — confirm the button triggers navigation.
  4. **Navigate:** **Current page:** `/kyc/complete` — wait for redirect → lands on `/yield` — confirm the “Yield Vault” heading appears.
  5. **Navigate:** **Current page:** `/yield` — click the browser Back button → lands on `/kyc/complete` — confirm the “KYC Verified” badge remains visible.
  6. **Verify on-screen:** **Current page:** `/kyc/complete` — confirm verification is complete and the user can proceed.
- **Voiceover:**
  > “KYC is complete, and we’re back on /kyc/complete with a clear Verified state. This is essential for compliant yield flows. Now, before we touch admin tools, I’ll show that admin routes are protected—regular users can’t just open /admin pages.”

## 9. Admin Route Protection (Non‑Admin Access Denied)
- **URL:** /admin/kyc
- **Shot:** An “Access denied” screen that clearly explains the connected wallet is not authorized, with a “Switch account” button.
- **Steps:**
  1. **Current page:** `/kyc/complete` — confirm the “KYC Verified” badge is visible.
  2. **Navigate:** Open URL directly: `/admin/kyc` → lands on `/admin/kyc` — confirm a heading like “Access denied” is visible.
  3. **Action:** **Current page:** `/admin/kyc` — confirm the page displays your wallet address and says it’s not authorized.
  4. **Action:** **Current page:** `/admin/kyc` — confirm the “Switch account” button is visible.
  5. **Action:** **Current page:** `/admin/kyc` — do not click anything yet — confirm admin table content is not visible.
  6. **Verify on-screen:** **Current page:** `/admin/kyc` — confirm non-admin users cannot access admin tools.
- **Voiceover:**
  > “This is a key security and UX improvement: even if someone guesses an admin URL, they hit an Access denied screen. Admin links don’t show up for regular users, and admin tools are gated by wallet allowlist. Now I’ll switch to the admin wallet so you can see the admin console become available.”

## 10. Admin Login + KYC Console (Admin‑Only UI)
- **URL:** /admin/kyc
- **Shot:** Admin KYC console with a table of KYC records plus a visible “Admin” indicator in the header.
- **Steps:**
  1. **Current page:** `/admin/kyc` — confirm the “Access denied” screen is visible.
  2. **Navigate:** **Current page:** `/admin/kyc` — click “Switch account” → confirm a Privy connection/login modal opens.
  3. **Action:** **Current page:** Privy modal — select “External wallet” (or your admin login method) — confirm the modal advances to connection.
  4. **Action:** **Current page:** Privy modal — complete login as the admin wallet — confirm the modal closes.
  5. **Navigate:** **Current page:** `/admin/kyc` — wait for the page to refresh — confirm the “KYC Admin” heading and a KYC table are now visible.
  6. **Verify on-screen:** **Current page:** `/admin/kyc` — confirm admin-only table content is visible and the header shows an admin-connected wallet state.
- **Voiceover:**
  > “Now we’re logged in as the admin wallet, and the admin console appears. This makes the experience clear: regular users never see admin controls, and admins get a dedicated operational console. With admin access verified, we’ll go back to the user flow and start signing real vault transactions with Privy.”

## 11. Yield Vault (KYC‑Gated Deposit + Signing)
- **URL:** /yield
- **Shot:** Vault UI showing KYC status, deposit panel with amount input, and transaction status/toasts.
- **Steps:**
  1. **Current page:** `/admin/kyc` — confirm the “KYC Admin” table is visible.
  2. **Navigate:** Open URL directly: `/yield` → lands on `/yield` — confirm a heading like “Yield Vault” and a “KYC Verified” badge is visible.
  3. **Action:** **Current page:** `/yield` — click “Deposit” — confirm an amount input appears.
  4. **(Only if needed) Enter values:**
     - Amount (WMNT) = `[DEPOSIT_WMNT=5]`
  5. Click “Confirm Deposit” — wait for a Privy signing/confirmation prompt and a “Transaction submitted” toast/state.
  6. **Verify on-screen:** **Current page:** `/yield` — confirm your vault position updates (balance/shares) and a tx hash link or “Confirmed” state appears.
- **Voiceover:**
  > “This is the core on-chain proof: a KYC-gated yield vault on Mantle Sepolia. I deposit 5 WMNT and sign the transaction through Privy’s wallet flow. The app shows submission and confirmation states so users always know what’s happening. Next, we’ll do creator-directed funding using a per-creator Boost Vault.”

## 12. Creator Boost Vault (Deposit to a Creator)
- **URL:** /boost/[creatorId]
- **Shot:** Per-creator boost vault page showing creator identity, deposit input, and your boost position.
- **Steps:**
  1. **Current page:** `/yield` — confirm your vault position is visible.
  2. **Navigate:** Open URL directly: `/boost/[creatorId]` → lands on `/boost/[creatorId]` — confirm the page shows the creator handle and a “Boost Vault” heading.
  3. **Action:** **Current page:** `/boost/[creatorId]` — click “Deposit Boost” — confirm an amount input is visible.
  4. **(Only if needed) Enter values:**
     - Amount (WMNT) = `[BOOST_WMNT=1]`
  5. Click “Confirm Boost Deposit” — wait for the Privy signing prompt and a “Boost deposit submitted” toast/state.
  6. **Verify on-screen:** **Current page:** `/boost/[creatorId]` — confirm “Your Boost Position” updates and a tx hash link is displayed.
- **Voiceover:**
  > “Boosting turns DeFi mechanics into creator funding. I deposit 1 WMNT into a creator-specific Boost Vault and sign through Privy. It’s transparent, composable, and it funds creators directly. Next we’ll sponsor a specific clip and generate an auditable campaign receipt.”

## 13. Sponsor a Clip (Create Campaign)
- **URL:** /sponsor/[postId]
- **Shot:** Sponsorship page tied to a specific clip, showing a clip preview and sponsor amount panel with a primary CTA.
- **Steps:**
  1. **Current page:** `/boost/[creatorId]` — confirm your boost position is visible.
  2. **Navigate:** Open URL directly: `/sponsor/[postId]` → lands on `/sponsor/[postId]` — confirm a “Sponsor” heading and the clip preview are visible.
  3. **Action:** **Current page:** `/sponsor/[postId]` — click the input labeled “Amount (WMNT)” — confirm the cursor is active.
  4. **(Only if needed) Enter values:**
     - Amount (WMNT) = `[SPONSOR_WMNT=2]`
  5. Click “Confirm Sponsorship” — wait for Privy signing and a “Campaign created” / “Transaction submitted” state.
  6. **Verify on-screen:** **Current page:** `/sponsor/[postId]` — confirm a success state is visible (toast/status/redirect prompt).
- **Voiceover:**
  > “Sponsorship is the creator revenue engine. I sponsor this clip with 2 WMNT and sign through Privy. The result is an on-chain action that’s easy for a consumer to do and easy for judges to verify. Next we’ll open the campaign receipt to see the terms hash, transaction status, and finality UX.”

## 14. Campaign Receipt + Finality Panel (On‑Chain Proof)
- **URL:** /campaign/[campaignId]
- **Shot:** Campaign receipt showing campaign ID, terms hash, tx status, MantleScan link, and a finality panel.
- **Steps:**
  1. **Current page:** `/sponsor/[postId]` — confirm the sponsorship success state is visible.
  2. **Navigate:** Open URL directly: `/campaign/[campaignId]` → lands on `/campaign/[campaignId]` — confirm a “Campaign Receipt” heading and “Terms Hash” are visible.
  3. **Action:** **Current page:** `/campaign/[campaignId]` — click “View Transaction on MantleScan” — confirm a new tab opens to `https://sepolia.mantlescan.xyz/` on the transaction page.
  4. **Navigate:** **Current page:** MantleScan tab — close the tab and return to the receipt — confirm the receipt is still visible.
  5. **Action:** **Current page:** `/campaign/[campaignId]` — scroll to the “Finality” panel — confirm you see finality/inclusion status text.
  6. **Verify on-screen:** **Current page:** `/campaign/[campaignId]` — confirm the receipt shows terms hash + tx status + explorer proof.
- **Voiceover:**
  > “This receipt is the judge-friendly proof: terms hash, transaction status, and a direct MantleScan link on Mantle Sepolia. We also surface a finality panel so users understand L2 inclusion and stability. Next we’ll open the Activity feed where every boost and sponsorship becomes a transparent event stream.”

## 15. On‑Chain Activity Feed (Transparent Ledger)
- **URL:** /activity
- **Shot:** Paginated activity list with event types, amounts, timestamps, and MantleScan links.
- **Steps:**
  1. **Current page:** `/campaign/[campaignId]` — confirm the receipt is visible.
  2. **Navigate:** Open URL directly: `/activity` → lands on `/activity` — confirm an “Activity” heading and event rows are visible.
  3. **Action:** **Current page:** `/activity` — click “Next” in pagination — confirm new rows load and the page indicator updates.
  4. **Action:** **Current page:** `/activity` — click “View on MantleScan” for an event row — confirm a new tab opens to `https://sepolia.mantlescan.xyz/`.
  5. **Navigate:** **Current page:** MantleScan tab — close the tab and return to `/activity` — confirm the event list remains visible.
  6. **Verify on-screen:** **Current page:** `/activity` — confirm event rows show tx links and clear event types.
- **Voiceover:**
  > “This Activity feed is the public ledger of engagement. Boosts and sponsorships aren’t claims—they’re verifiable events with explorer links. That transparency makes the consumer app credible. Next we’ll turn these confirmed events into rankings via the Leaderboard.”

## 16. Leaderboard (Ranked Incentives)
- **URL:** /leaderboard
- **Shot:** Leaderboard with ranked creators/campaigns, totals, and clickable rows.
- **Steps:**
  1. **Current page:** `/activity` — confirm the activity list is visible.
  2. **Navigate:** Open URL directly: `/leaderboard` → lands on `/leaderboard` — confirm a “Leaderboard” heading and ranked rows are visible.
  3. **Action:** **Current page:** `/leaderboard` — click a creator row — confirm a detail view or navigation target appears (profile or highlight).
  4. **Navigate:** **Current page:** `/leaderboard` — click the browser Back button if you navigated away — confirm you return to `/leaderboard`.
  5. **Action:** **Current page:** `/leaderboard` — point out totals derived from activity — confirm totals are visible on-screen.
  6. **Verify on-screen:** **Current page:** `/leaderboard` — confirm rankings and totals are displayed.
- **Voiceover:**
  > “Leaderboards convert on-chain actions into social incentives. Boosting and sponsoring translate into rankings users can compete on. Next, we’ll publish a Boost Pass epoch as the admin so perks become verifiable and redeemable.”

## 17. Admin Boost Pass (Publish Epochs On‑Chain)
- **URL:** /admin/boost-pass
- **Shot:** Admin Boost Pass page with snapshot/epoch controls and a publish action that produces an on-chain tx.
- **Steps:**
  1. **Current page:** `/leaderboard` — confirm ranked rows are visible.
  2. **Navigate:** Open URL directly: `/admin/boost-pass` → lands on `/admin/boost-pass` — confirm a “Boost Pass Admin” heading and snapshot/epoch UI is visible.
  3. **Action:** **Current page:** `/admin/boost-pass` — click “Publish Epoch” — confirm a “Publishing…” state appears.
  4. **Action:** **Current page:** `/admin/boost-pass` — sign the transaction when prompted — wait for an “Epoch published” toast/state.
  5. **Action:** **Current page:** `/admin/boost-pass` — click “View on MantleScan” — confirm `https://sepolia.mantlescan.xyz/` opens on the tx page.
  6. **Verify on-screen:** **Current page:** `/admin/boost-pass` — confirm the epoch status updates and shows an on-chain tx hash/link.
- **Voiceover:**
  > “This is where incentives become real: the admin publishes Boost Pass epochs based on leaderboard snapshots, and it’s recorded on-chain. That makes perk eligibility verifiable. Next we’ll switch to the user-facing perks page to claim the Remix Pack.”

## 18. Boost Pass Perks (Claim + Download Remix Pack)
- **URL:** /perks/boost-pass
- **Shot:** Perks page showing ownership check and a “Download Remix Pack” button.
- **Steps:**
  1. **Current page:** `/admin/boost-pass` — confirm an epoch is published.
  2. **Navigate:** Open URL directly: `/perks/boost-pass` → lands on `/perks/boost-pass` — confirm a “Boost Pass” heading and an ownership/eligibility status is visible.
  3. **Action:** **Current page:** `/perks/boost-pass` — click “Download Remix Pack” — confirm a download starts or a “Download started” toast appears.
  4. **Action:** **Current page:** `/perks/boost-pass` — confirm a visible success indicator remains (ownership badge or eligibility check).
  5. **Action:** **Current page:** `/perks/boost-pass` — pause on the perks description — confirm it explains remix benefits.
  6. **Verify on-screen:** **Current page:** `/perks/boost-pass` — confirm the user can download the Remix Pack after eligibility checks.
- **Voiceover:**
  > “Now the incentives pay off. The perks page verifies Boost Pass eligibility and lets users download a Remix Pack immediately. This is how ClipYield turns on-chain participation into creator tools. Next we’ll go to Projects to see the imported Remix Pack ready to edit.”

## 19. Projects List (Creator Workspace)
- **URL:** /projects
- **Shot:** Projects table/list with an imported Remix Pack project entry visible.
- **Steps:**
  1. **Current page:** `/perks/boost-pass` — confirm perks and download controls are visible.
  2. **Navigate:** Open URL directly: `/projects` → lands on `/projects` — confirm a “Projects” heading and project rows are visible.
  3. **Action:** **Current page:** `/projects` — locate the project row labeled “Boost Pass Remix Pack” — confirm it exists as a visible row.
  4. **Action:** **Current page:** `/projects` — click “Open” on the “Boost Pass Remix Pack” row → lands on `/projects/[id]` — confirm the editor loads.
  5. **Navigate:** **Current page:** `/projects/[id]` — wait for editor UI to finish loading — confirm timeline clips are visible.
  6. **Verify on-screen:** **Current page:** `/projects/[id]` — confirm the project opens successfully and the timeline is ready.
- **Voiceover:**
  > “This is the creator workspace. The Remix Pack isn’t just a collectible—it becomes a real editable project. We open it and the editor loads with assets ready to remix. Next we’ll export a finished MP4 and upload it back into the feed.”

## 20. Timeline Editor + Export (Remix Production)
- **URL:** /projects/[id]
- **Shot:** Full editor view with timeline, preview, and export controls with render progress.
- **Steps:**
  1. **Current page:** `/projects/[id]` — confirm the timeline editor is visible and an “Export” button exists.
  2. **Action:** **Current page:** `/projects/[id]` — click “Preview” — confirm the preview plays and the playhead moves.
  3. **Action:** **Current page:** `/projects/[id]` — click “Export” — confirm an export modal or progress indicator appears.
  4. **(Only if needed) Enter values:**
     - Export name = `[EXPORT_NAME="clipyield_remix"]`
  5. Click “Start Export” — wait for progress to reach 100% and an “Export complete” state.
  6. **Verify on-screen:** **Current page:** `/projects/[id]` — confirm “Export complete” and a “Download MP4” button/link is visible.
- **Voiceover:**
  > “Now we turn perks into actual content. We preview, export, and get a real downloadable MP4 with a clear render progress UI. This is what makes ClipYield a true creator product: on-chain incentives unlock tools, and tools produce content. Next we’ll upload this remix back into the feed.”

## 21. Upload Remix (Publish Back to Feed)
- **URL:** /upload
- **Shot:** Upload page with file picker + caption input and a publish CTA; then a visible success state after publish.
- **Steps:**
  1. **Current page:** `/projects/[id]` — confirm “Export complete” is visible.
  2. **Navigate:** Open URL directly: `/upload` → lands on `/upload` — confirm an “Upload” heading and a video upload panel is visible.
  3. **Action:** **Current page:** `/upload` — click “Choose File” — confirm the OS file picker opens.
  4. **(Only if needed) Enter values:**
     - Video file = `[FILE="clipyield_remix.mp4"]`
     - Caption = `[CAPTION="Boost Pass Remix — sponsored on Mantle Sepolia 🚀"]`
  5. Click “Publish” — wait for an “Uploaded” toast/state and redirect.
  6. **Verify on-screen:** **Current page:** `/` — confirm the newly uploaded clip appears in the feed with the caption visible.
- **Voiceover:**
  > “This closes the loop. We upload the exported remix, publish it, and it’s live in the feed. This proves ClipYield isn’t just on-chain mechanics—it’s a full consumer creator pipeline. Finally, I’ll show the small API proof that powers the campaign finality UX we saw earlier.”

## 22. Mantle Rollup Info API (Finality UX Proof Endpoint)
- **URL:** /api/mantle/rollup-info
- **Shot:** Raw JSON response showing `{ ok, info }` fields used by the finality panel.
- **Steps:**
  1. **Current page:** `/` — confirm your newly uploaded clip is visible.
  2. **Navigate:** Open URL directly: `/api/mantle/rollup-info` → lands on `/api/mantle/rollup-info` — confirm a JSON response is visible.
  3. **Action:** **Current page:** `/api/mantle/rollup-info` — highlight the `ok` field — confirm it indicates success (e.g., `true`).
  4. **Action:** **Current page:** `/api/mantle/rollup-info` — scroll slightly — confirm `info` fields are visible.
  5. **Action:** **Current page:** `/api/mantle/rollup-info` — copy the URL in the address bar — confirm it’s exactly `/api/mantle/rollup-info`.
  6. **Verify on-screen:** **Current page:** `/api/mantle/rollup-info` — confirm the API returns a valid JSON payload used by the receipt finality panel.
- **Voiceover:**
  > “This endpoint powers the finality panel UX: it returns rollup status data so users can understand inclusion and stability on Mantle Sepolia. It’s a small detail, but it makes on-chain receipts feel consumer-friendly. Now we’ll wrap with the full journey we just proved.”

## Final Wrap-Up
- **URL:** /profile/[id]
- **Shot:** Creator profile showing follower state, visible Boost/Sponsor CTAs, and the creator’s posts including the new remix.
- **Steps:**
  1. **Current page:** `/api/mantle/rollup-info` — confirm JSON is visible.
  2. **Verify final state:** Open URL directly: `/profile/[id]` — confirm “Following” state is visible, Boost/Sponsor CTAs are visible, and the new remix post appears in the creator’s posts list/grid.
- **Voiceover:**
  > “We proved a complete loop: Privy-powered wallet onboarding and transaction signing, KYC gating, yield vault deposits, creator boosts, clip sponsorship receipts with finality UX, transparent activity and leaderboards, and Boost Pass perks that unlock Remix Packs creators can edit and re-upload. ClipYield makes on-chain funding feel native to short-form video. Try it at [DEMO_URL].”
