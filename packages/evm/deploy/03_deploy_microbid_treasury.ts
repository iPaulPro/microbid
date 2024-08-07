import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMicroBidTreasury: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  const { address: tokenAddress } = await get("MicroBidToken");
  const { address: attesterAddress } = await get("MicroBidAttester");

  await deploy("MicroBidTreasury", {
    from: deployer,
    args: [deployer, process.env.USDC_ADDRESS, tokenAddress, attesterAddress],
    log: true,
    autoMine: true,
  });
};

export default deployMicroBidTreasury;

deployMicroBidTreasury.tags = ["MicroBidTreasury"];
