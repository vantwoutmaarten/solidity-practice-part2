const {networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER} = require("../helper-hardhat-config");
const {network } = require("hardhat");

module.exports = async ( {getNamedAccounts, deployments} ) => {
    const { deploy, log } = deployments

const { deployer } = await getNamedAccounts()
const chainId = network.config.chainId

if(developmentChains.includes(network.name)) {
    log("Local network detected..")
    await deploy("MockV3Aggregator", {
        contract: "MockV3Aggregator",
        from: deployer,
        log: true,
        args: [DECIMALS, INITIAL_ANSWER]
    })
    log("Mocks Deployed!")
    log("------------------------------")
}
}

module.exports.tags = ["all", "mocks"]