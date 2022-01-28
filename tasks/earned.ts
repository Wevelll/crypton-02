import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { contractAddr } from "../hardhat.config";

task("earned", "Prints the amount of reward tokens earned by <account>")
.addParam("account", "Account earning rewards")
.setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Staking", contractAddr);
    const result = await contract.earned(taskArgs.account);
    console.log(taskArgs.account + " earned " + result.toString());
});