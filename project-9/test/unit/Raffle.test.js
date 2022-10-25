const { inputToConfig } = require("@ethereum-waffle/compiler");
const { assert, expect } = require("chai");
const { network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let raffle, vrfCoordinatorMock;
      const chainId = network.config.chainId;
      let deployer, interval;
      // let raffleEntranceFee;
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorMock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        interval = await raffle.getInterval();
        // raffleEntranceFee = await raffle.entranceFee();
      });

      describe("constructor", function () {
        it("should set the correct values", async function () {
          const raffleState = await raffle.getRaffleState();
          const interval = await raffle.getInterval();
          assert.equal(raffleState.toString(), "0");
          assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
        });
      });

      describe("enterRaffle", function () {
        it("reverts when you don't pay enough", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWith(
            "Raffle_NotEnoughETHEntered"
          );
        });
        it("records players when they enter", async function () {
          await raffle.enterRaffle({ value: ethers.utils.parseEther("0.1") });
          const playerFromContract = await raffle.getPlayer(0);
          assert.equal(playerFromContract, deployer);
        });
        it("emits event on enter", async function () {
          await expect(
            raffle.enterRaffle({ value: ethers.utils.parseEther("0.1") })
          ).to.emit(raffle, "RaffleEnter");
          // .withArgs(deployer, 0);
        });
        it("doesnt allow entrance when raffle is calcualting", async function () {
          await expect(
            raffle.enterRaffle({ value: ethers.utils.parseEther("0.1") })
          );
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine");
          await raffle.performUpkeep([]);
          await expect(
            raffle.enterRaffle({ value: ethers.utils.parseEther("0.1") })
          ).to.be.revertedWith("Raffle_NotOpen");
        });
      });
      describe("checkUpKeep", () => {
        it("returns false if raffle isnt open", async function () {
          await raffle.enterRaffle({ value: ethers.utils.parseEther("0.1") });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          await raffle.performUpkeep("0x");
          const raffleState = await raffle.getRaffleState();
          const { upkeepNeeded } = await raffle.checkUpKeep("0x");
          assert.equal(raffleState.toString(), "1");
          assert.equal(upkeepNeeded, false);
        });
      });
      describe("performUpKeep", () => {
        it("it can only run if checkupkeep is tru", async function () {
          await raffle.enterRaffle({ value: ethers.utils.parseEther("0.1") });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);

          const tx = raffle.performUpkeep("0x");
          assert(tx);
        });
        it("reverts when checkUpkeep is false", async function () {
          await expect(raffle.performUpkeep("0x")).to.be.revertedWith(
            "Raffle_UpkeepNotNeeded"
          );
        });
        it("updates the raffle state, emits and even and calls the vrf coordinator", async function () {
          await raffle.enterRaffle({ value: ethers.utils.parseEther("0.1") });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const txResponse = await raffle.performUpkeep("0x");
          const txReceipt = await txResponse.wait(1);
          const requestId = txReceipt.events[1].args.requestId;
          const raffleState = await raffle.getRaffleState();
          assert(requestId > 0);
          assert(raffleState == 1);
        });
      });
      describe("fulfillRandomness", () => {
        beforeEach(async function () {
          await raffle.enterRaffle({ value: ethers.utils.parseEther("0.1") });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
        });
        it("can only be called after perform upkeep", async function () {
          await expect(
            vrfCoordinatorMock.fulfillRandomWords("0", raffle.address)
          ).to.be.revertedWith("nonexistent request");
        });
        it("picks a winner, resets the lottery and sends money", async function () {
          const additionalEntrants = 3;
          const startingAccountIndex = 1;
          const accounts = await ethers.getSigners();
          for (
            let i = startingAccountIndex;
            i < startingAccountIndex + additionalEntrants;
            i++
          ) {
            const accountConnectedRaffle = raffle.connect(accounts[i]);
            await accountConnectedRaffle.enterRaffle({
              value: ethers.utils.parseEther("0.1"),
            });
          }
          const startingTimeStamp = await raffle.getLatestTimestamp();

          // performUpkeep mock being the keeper
          // kick of the VRF sending random words back
          // We  will simulate to wait for the fullfilment of the randomness

          await new Promise(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              console.log("found the event");
              try {
                const recentWinner = await raffle.getRecentWinner();
                const endingTimeStamp = await raffle.getLatestTimestamp();
                const raffleState = await raffle.getRaffleState();
                assert.equal(raffleState.toString(), "0");
                assert(endingTimeStamp > startingTimeStamp);
                resolve();
              } catch (error) {
                reject(error);
              }
            });
            const tx = await raffle.performUpkeep("0x");
            const txReceipt = await tx.wait(1);
            await vrfCoordinatorMock.fulfillRandomWords(
              txReceipt.events[1].args.requestId,
              raffle.address
            );
          });
        });
      });
    });
