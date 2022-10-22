const {networkConfig, developmentChains} = require("../helper-hardhat-config");
const {network } = require("hardhat");


module.exports = async ( {getNamedAccounts, deployments} ) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if(developmentChains.includes(network.name)){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const fundMe = await deploy("FundMe", {
        from : deployer, 
        args: [ethUsdPriceFeedAddress], //put pricefeed address,
        log: true
    })

log("---------------------------------------")
}

module.exports.tags = ["all", "fundme"]