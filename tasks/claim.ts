import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { contractAddr } from "../hardhat.config";

task("claim", "Claim reward from staking contract")
.setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Staking", contractAddr);
    const result = await contract.claim();
    console.log(result.data.toString());
})