const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
developmentChains.includes(hre.network.name)
    ? describe("FundMe", async function () {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1");

          beforeEach(async function () {
              // Deploy our fundMe contract
              // using Hardhat deploy function
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer);

              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });
          describe("constructor", async () => {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.s_priceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });
          describe("fund", async () => {
              it("fails if you do not send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  );
              });
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.s_addressToAmountFunded(
                      deployer
                  );
                  assert.equal(response.toString, sendValue.toString);
              });
              it("Adds funder to array of s_funders", async function () {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.s_funders(0);
                  assert.equal(funder, deployer);
              });
          });
          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });

              it("fails if you try to withdraw more than you have funded", async function () {
                  // Arrange act Assert
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);
                  // Act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;

                  // Assert
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  //Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("allows us to withdraw with multiple funder", async function () {
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 5; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });

                      const startFundMeBalance =
                          await ethers.provider.getBalance(fundMe.address);
                      const startDeployerBalance =
                          await ethers.provider.getBalance(deployer);
                      // Act
                      const transactionResponse = await fundMe.withdraw();
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      );
                      const { gasUsed, effectiveGasPrice } = transactionReceipt;

                      // Assert
                      const endingFundMeBalance =
                          await ethers.provider.getBalance(fundMe.address);
                      const endingDeployerBalance =
                          await ethers.provider.getBalance(deployer);
                  }
              });

              it("only allows the i_owner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(attackerConnectedContract.withdraw()).to.be
                      .reverted;
              });
          });
          describe("Cheaper withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });

              it("fails if you try to withdraw more than you have funded", async function () {
                  // Arrange act Assert
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);
                  // Act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;

                  // Assert
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  //Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("allows us to withdraw with multiple funder", async function () {
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 5; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });

                      const startFundMeBalance =
                          await ethers.provider.getBalance(fundMe.address);
                      const startDeployerBalance =
                          await ethers.provider.getBalance(deployer);
                      // Act
                      const transactionResponse =
                          await fundMe.cheaperWithdraw();
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      );
                      const { gasUsed, effectiveGasPrice } = transactionReceipt;

                      // Assert
                      const endingFundMeBalance =
                          await ethers.provider.getBalance(fundMe.address);
                      const endingDeployerBalance =
                          await ethers.provider.getBalance(deployer);
                  }
              });

              it("only allows the i_owner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(attackerConnectedContract.withdraw()).to.be
                      .reverted;
              });
          });
      })
    : describe.skip;
