import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ClipYieldBoostPass", (m) => {
  const admin = m.getAccount(0);
  const kycRegistry = m.getParameter("kycRegistry");
  const baseUri = m.getParameter("baseUri");

  const boostPass = m.contract("ClipYieldBoostPass", [kycRegistry, baseUri, admin]);

  return { boostPass };
});
