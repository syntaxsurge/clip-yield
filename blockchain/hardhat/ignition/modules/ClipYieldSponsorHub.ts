import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ClipYieldSponsorHub", (m) => {
  const wmnt = m.getParameter(
    "wmnt",
    "0x19f5557E23e9914A18239990f6C70D68FDF0deD5",
  );
  const kycRegistry = m.getParameter("kycRegistry");

  const hub = m.contract("ClipYieldSponsorHub", [wmnt, kycRegistry]);

  return { hub };
});
