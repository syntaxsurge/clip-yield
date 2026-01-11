import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ClipYieldModule", (m) => {
  const admin = m.getAccount(0);

  const asset = m.getParameter(
    "asset",
    "0x19f5557E23e9914A18239990f6C70D68FDF0deD5",
  );
  const shareName = m.getParameter("shareName", "ClipYield Vault Share");
  const shareSymbol = m.getParameter("shareSymbol", "cySHARE");
  const creatorCutBps = m.getParameter("creatorCutBps", 1500);
  const protocolFeeBps = m.getParameter("protocolFeeBps", 500);

  const kyc = m.contract("KycRegistry", [admin]);
  const vault = m.contract("ClipYieldVault", [asset, kyc, admin, shareName, shareSymbol]);
  const boostFactory = m.contract("ClipYieldBoostVaultFactory", [
    kyc,
    asset,
    creatorCutBps,
    admin,
  ]);
  const invoiceReceipts = m.contract("ClipYieldInvoiceReceipts", [kyc, admin]);
  const sponsorHub = m.contract("ClipYieldSponsorHub", [
    asset,
    kyc,
    vault,
    invoiceReceipts,
    protocolFeeBps,
  ]);

  m.call(invoiceReceipts, "setMinter", [sponsorHub]);
  m.call(kyc, "setVerified", [sponsorHub, true]);

  return { kyc, vault, boostFactory, sponsorHub, invoiceReceipts };
});
