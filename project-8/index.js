import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
connectButton.onclick = connect;
fundButton.onclick = fund;

async function connect() {
  if (typeof window.ethereum != "undefined") {
    const accounts = await window.ethereum
      .request({
        method: "eth_requestAccounts",
      })
      .then((result) => {
        // The result varies by RPC method.
        // For example, this method will return a transaction hash hexadecimal string on success.
        console.log("result", result);
        document.getElementById("connectButton").innerHTML = "Connected";
      })
      .catch((error) => {
        console.log("error", error);
        document.getElementById("connectButton").innerHTML =
          "Please Install Metamast";
        // If the request fails, the Promise will reject with an error.
      });
  }
}

async function fund() {
  const ethAmount = "7";
  console.log("ethAmount", ethAmount);
  if (typeof window.ethereum != "undefined") {
    // need a provider/connection to the blockchain
    // signer /wallet with gas
    //contract that we interact with ABI and address
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const tx = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMing(tx, provider);

      console.log("done");
    } catch (error) {
      console.log("error", error);
    }
  }
}

function listenForTransactionMing(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  //Listen for transaction=s and events
  return new Promise((resolve, reject) => {
    const txReceipt = transactionResponse.hash;
    provider.once(txReceipt, (txReceipt) => {
      console.log(`Mined ${txReceipt.hash}`);
      console.log(
        `Completed with status ${txReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}
