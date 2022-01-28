import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { contractAddr } from "../hardhat.config";

task("unstake", "Unstake <amount> of tokens")
.addParam("amount", "Amount to unstake")
.setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Staking", contractAddr);
    const result = await contract.unstake(
        hre.ethers.utils.parseEther(taskArgs.amount)
        );
    console.log("Withdrawn " + taskArgs.amount + " tokens!");
});