require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();


module.exports = {
    solidity: {
        compilers: [
    {version: "0.8.8"},    
    {version: "0.6.6"},    
        ]
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli : {
            url: process.env.GOERLI_URL || "",
            accounts: [process.env.PRIVATE_KEY],
            chainId: 5,
        }
    },
    namedAccounts: {
        deployer: {
            default: 0,
            5: 0,
        },
        user: {
            default: 1,
        }
    }
};