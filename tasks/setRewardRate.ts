import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { contractAddr } from "../hardhat.config";

task("setRewardRate", "Sets the <amount> of reward tokens given per second")
.addParam("amount", "New reward rate in wei")
.setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Staking", contractAddr);
    const result = await contract.setRewardRate(
        hre.ethers.utils.parseEther(taskArgs.amount)
        );
    console.log(result.toString());
});