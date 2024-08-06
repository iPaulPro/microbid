import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMicroBidToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("MicroBidToken", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
};

export default deployMicroBidToken;

deployMicroBidToken.tags = ["MicroBidToken"];
