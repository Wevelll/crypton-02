import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { contractAddr } from "../hardhat.config";

task("rewardPerToken", "Prints the amount of reward tokens given per staked tokens")
.setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Staking", contractAddr);
    const result = await contract.rewardPerToken();
    console.log(result.toString() + " reward tokens for single staked");
});