import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import getNextContractAddress from "../lib/getNextContractAddress";

const deployMicroBidToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const treasuryAddress = await getNextContractAddress(deployer, 3);
  const auctionAddress = await getNextContractAddress(deployer, 4);

  await deploy("MicroBidToken", {
    from: deployer,
    args: [treasuryAddress, auctionAddress],
    log: true,
    autoMine: true,
  });
};

export default deployMicroBidToken;

deployMicroBidToken.tags = ["MicroBidToken"];
