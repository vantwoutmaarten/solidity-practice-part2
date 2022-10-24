const { developmentChains } = require("../helper-hardhat-config");

const BASE_FEE = ethers.utils.parseEther("0.3");
const GAS_PRICE_LINK = 1e9; //calculated value based on gas price.

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = network.config.chainId;

  if (developmentChains.includes(network.name)) {
    console.log(" development chain detected");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: [BASE_FEE, GAS_PRICE_LINK],
      log: true,
    });
    log("Mocks deployed!");
    log("====================================");
  }
};

module.exports.tags = ["mocks", "all"];
