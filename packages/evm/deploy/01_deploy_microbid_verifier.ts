import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import getNextContractAddress from "../lib/getNextContractAddress";

const deployMicroBidPoPVerifier: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const attesterAddress = await getNextContractAddress(deployer);

  await deploy("MicroBidPoPVerifier", {
    from: deployer,
    args: [
      deployer,
      process.env.WORLD_ID_ADDRESS,
      process.env.WORLD_ID_APP_ID,
      process.env.WORLD_ID_ACTION_ID,
      attesterAddress,
    ],
    log: true,
    autoMine: true,
  });
};

export default deployMicroBidPoPVerifier;

deployMicroBidPoPVerifier.tags = ["MicroBidPoPVerifier"];
