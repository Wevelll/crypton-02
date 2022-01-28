import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { contractAddr, stakingAddr } from "../hardhat.config";

task("stake", "Stake <amount> of tokens")
.addParam("amount", "Amount of tokens to stake")
.setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Staking", contractAddr);
    const stakingTokens = await hre.ethers.getContractAt("IERC20", stakingAddr);
    await stakingTokens.approve(
        contractAddr, 
        hre.ethers.utils.parseEther(taskArgs.amount)
    );
    const result = await contract.stake(
        hre.ethers.utils.parseEther(taskArgs.amount)
    );
    console.log("Staked " + taskArgs.amount + " tokens");
});