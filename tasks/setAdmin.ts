import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { contractAddr } from "../hardhat.config";

task("setAdmin", "Set <account> as admin")
.addParam("account", "Account setting as admin")
.setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Staking", contractAddr);
    const result = await contract.setAdmin(taskArgs.account);
    console.log(result.toString());
});