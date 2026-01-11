import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SimulatedYieldStreamerModule", (m) => {
  const admin = m.getAccount(0);
  const asset = m.getParameter(
    "asset",
    "0x19f5557E23e9914A18239990f6C70D68FDF0deD5",
  );
  const vault = m.getParameter("vault");
  const ratePerSecond = m.getParameter("ratePerSecond", 100000000000000n);

  const streamer = m.contract("SimulatedYieldStreamer", [
    asset,
    vault,
    ratePerSecond,
    admin,
  ]);

  return { streamer };
});
