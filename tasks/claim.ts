import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { contractAddr, rewardAddr } from "../hardhat.config";

task("claim", "Claim reward from staking contract")
.setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Staking", contractAddr);
    const rewards = await hre.ethers.getContractAt("IERC20", rewardAddr);
    const balance1 = await rewards.balanceOf(signer.address);
    const result = await contract.claim();
    const balance2 = await rewards.balanceOf(signer.address);
    console.log("Claimed " + balance2.sub(balance1).toString() + " tokens");
})