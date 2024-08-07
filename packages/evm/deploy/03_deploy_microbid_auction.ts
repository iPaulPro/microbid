import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMicroBidAuction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  const { address: tokenAddress } = await get("MicroBidToken");
  const { address: attesterAddress } = await get("MicroBidAttester");

  await deploy("MicroBidAuction", {
    from: deployer,
    args: [deployer, tokenAddress, process.env.USDC_ADDRESS, attesterAddress],
    log: true,
    autoMine: true,
  });
};

export default deployMicroBidAuction;

deployMicroBidAuction.tags = ["MicroBidAuction"];