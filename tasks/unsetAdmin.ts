import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { contractAddr } from "../hardhat.config";

task("unsetAdmin", "Remove <account> from admins")
.addParam("account", "Account removed from admins")
.setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Staking", contractAddr);
    const result = await contract.unsetAdmin(taskArgs.account);
    console.log(taskArgs.account + " removed from admins!");
});