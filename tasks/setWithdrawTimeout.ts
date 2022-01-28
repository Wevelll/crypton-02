import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { contractAddr } from "../hardhat.config";

task("setWithdrawTimeout", "Sets withdraw <timeout> in seconds")
.addParam("timeout", "New timeout")
.setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Staking", contractAddr);
    const result = await contract.setWithdrawTimeout(taskArgs.timeout);
    console.log(result.toString());
});