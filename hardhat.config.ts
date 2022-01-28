import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "./tasks/index";

dotenv.config();
export let contractAddr = process.env.CONTRACT_ADDR !== undefined ? process.env.CONTRACT_ADDR : "";
export let stakingAddr = process.env.STAKING_ADDR !== undefined ? process.env.STAKING_ADDR : "";
export let rewardAddr = process.env.REWARD_ADDR !== undefined ? process.env.REWARD_ADDR : "";

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []
    },
  }
};


export default config;
