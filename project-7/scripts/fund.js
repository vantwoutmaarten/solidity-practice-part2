const { getNamedAccounts, deployments } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("funding contract....");
    const transactionResponse = await fundMe.fund({
        value: ethers.utils.parseEther("0.1"),
    });

    const receipt = await transactionResponse.wait(1);
    console.log("funded", receipt);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
