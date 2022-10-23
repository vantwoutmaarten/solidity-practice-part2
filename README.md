# solidity-practice-part2

Going to practice a ton of new projects from PatrickAlphaC, full stack smart lottery app, Defi/Aave, Upgrades, DAOs, fullstack NFT marketplace, Auditing

Project 1-6 are not included in this repo.

Project 7: Hardhat Fund Me

Creating a contract that everyone can fund with at least $50 worth of ETH and only the owner can withdraw.
Deployments are done with hardhat deploy and chainlink price feeds are used aswell as mocked price feeds.
The deploy scripts checks for development network, so these same scripts can be used for any network.
an extra configuration file helper-hardhat-config is used to specify extra config paramters.

It contains unit test for local testing and staging tests for test used on goerli.
Also two scripts are added to fund or withdraw eth from contracts.

Project 8: HTML / Javascript Fund Me (Full Stack / Front End)

A very trivial HTML/Javascript website to connect your metamask wallet and interact with the Fund Me contract.

copied the ethers.js file and added it to our page, so we manually added ethers lib to our local front-end.

With the Ethers Web3Provider takes the endpoint provided by metamask/ window.ethereum and can create a provider from it.

Project 9: Hardhat Smart Contract Lottery

People will be able to enter the raffle and a verfifiable random winner will be picked.
The winner will be selected every X minutes, this will be done with chainlink keepers or gelato.

Project 10: NextJS Smart Contract Lottery (Full Stack / Front End)
Project 11: Hardhat Starter Kit
Project 12: Hardhat ERC20s
Project 13: Hardhat DeFi & Aave
Project 14: Hardhat NFTs
Project 15: NextJS NFT Marketplace (Full Stack / Front End)
Project 16: Hardhat Upgrades
Project 17: Hardhat DAOs
Project 18: Security & Auditing
