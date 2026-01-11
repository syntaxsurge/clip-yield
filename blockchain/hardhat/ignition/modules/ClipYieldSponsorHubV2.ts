import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ClipYieldSponsorHubV2", (m) => {
  const admin = m.getAccount(0);
  const wmnt = m.getParameter(
    "wmnt",
    "0x19f5557E23e9914A18239990f6C70D68FDF0deD5",
  );
  const kycRegistry = m.getParameter("kycRegistry");
  const yieldVault = m.getParameter("yieldVault");
  const protocolFeeBps = m.getParameter("protocolFeeBps", 500);

  const registry = m.contractAt("KycRegistry", kycRegistry);
  const invoiceReceipts = m.contract("ClipYieldInvoiceReceipts", [kycRegistry, admin]);
  const hub = m.contract("ClipYieldSponsorHub", [
    wmnt,
    kycRegistry,
    yieldVault,
    invoiceReceipts,
    protocolFeeBps,
  ]);

  m.call(invoiceReceipts, "setMinter", [hub]);
  m.call(registry, "setVerified", [hub, true]);

  return { hub, invoiceReceipts };
});
