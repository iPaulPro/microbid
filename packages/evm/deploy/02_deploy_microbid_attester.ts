import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMicroBidAttester: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  const { address: verifierAddress } = await get("MicroBidPoPVerifier");

  await deploy("MicroBidAttester", {
    from: deployer,
    args: [deployer, process.env.EAS_ADDRESS, process.env.EAS_SCHEMA, verifierAddress],
    log: true,
    autoMine: true,
  });
};

export default deployMicroBidAttester;

deployMicroBidAttester.tags = ["MicroBidAttester"];
