import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import { Staking, Staking__factory } from "../typechain";
import { IERC20, Token__factory } from "../typechain";

describe("Staking contract", function () {
  let stakingContract: Staking;
  let stakingToken: IERC20;
  let rewardsToken: IERC20;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  before(async function () {
    //get needed signers
    [owner, admin, addr1, addr2] = await ethers.getSigners();

    const stakingFactory = (await ethers.getContractFactory(
      "Staking", owner
    )) as Staking__factory;

    const stakingTokenFactory = (await ethers.getContractFactory(
      "Token", owner
    )) as Token__factory;

    stakingToken = await stakingTokenFactory.deploy("stakingToken", "ST", ethers.utils.parseEther("2000"));
    rewardsToken = await stakingTokenFactory.deploy("rewardsToken", "RT", ethers.utils.parseEther("5000"));

    //deploy contract and set staking and reward tokens
    stakingContract = await stakingFactory.deploy(stakingToken.address, rewardsToken.address);

    //add rewards to contract
    await rewardsToken.transfer(stakingContract.address, ethers.utils.parseEther("5000"));

    //send staking tokens to testing addresses
    await stakingToken.transfer(addr1.address, ethers.utils.parseEther("500"));
    await stakingToken.transfer(addr2.address, ethers.utils.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set correct balances", async function () {
      expect (
        await rewardsToken.balanceOf(stakingContract.address)
      ).to.be.equal(ethers.utils.parseEther("5000"));
      expect (
        await stakingToken.balanceOf(addr1.address)
      ).to.be.equal(ethers.utils.parseEther("500"));
      expect (
        await stakingToken.balanceOf(addr2.address)
      ).to.be.equal(ethers.utils.parseEther("1000"));
    });
  });

  describe("Staking", function () {
    it("Should stake some tokens", async function () {
        //approve stakable tokens to staking contract
        await stakingToken.approve(stakingContract.address, ethers.utils.parseEther("100"));
        await stakingToken.connect(addr1).approve(stakingContract.address, ethers.utils.parseEther("500"));
        await stakingToken.connect(addr2).approve(stakingContract.address, ethers.utils.parseEther("1000"));
        expect (
          await stakingContract.stake(ethers.utils.parseEther("100"))
        ).to.satisfy;
        expect (
          await stakingContract.connect(addr1).stake(ethers.utils.parseEther("500"))
        ).to.satisfy;
        expect (
          await stakingContract.connect(addr2).stake(ethers.utils.parseEther("1000"))
        ).to.satisfy;
    });

    it("Cannot unstake until certain time", async function () {
      await expect (
        stakingContract.unstake(ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Cannot withdraw yet!");
    })

  });

  describe("Claim", function () {
    it("Should claim reward", async function () {
      const balance1 = await rewardsToken.balanceOf(addr1.address);
      console.log("Balance before claim " + balance1.toString());
      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine");
      expect (
        await stakingContract.connect(addr1).claim()
      ).to.satisfy;
      let balance2 = await rewardsToken.balanceOf(addr1.address);
      console.log("Balance after claim " + balance2.toString());
    });
  });

  describe("Withdraw", function () {
    it("Can unstake after some time", async function () {
      let balance1 = await stakingToken.balanceOf(addr2.address);
      console.log("Staking balance: " + balance1.toString());
      let balance11 = await rewardsToken.balanceOf(addr2.address);
      console.log("Rewards balance: " + balance11.toString());
      expect (
        await stakingContract.connect(addr2).unstake(ethers.utils.parseEther("100"))
      ).to.satisfy;
      let balance2 = await stakingToken.balanceOf(addr2.address);
      console.log("Staking balance: " + balance2.toString());
      let balance22 = await rewardsToken.balanceOf(addr2.address);
      console.log("Rewards balance: " + balance22.toString());
    });
  });

  describe("Admins", function () {
    it("Owner can set admin", async function () {
      expect (
        await stakingContract.setAdmin(admin.address)
      ).to.satisfy;
    });

    it("Others cannot set admin", async function () {
      await expect (
        stakingContract.connect(admin).setAdmin(addr1.address)
      ).to.be.revertedWith("You are not the owner!");
    });

    it("Admin can change rewardrate", async function () {
      expect (
        await stakingContract.connect(admin).setRewardRate(ethers.utils.parseEther("1"))
      ).to.satisfy;
    });

    it("Admin can set timeouts", async function () {
      expect (
        await stakingContract.connect(admin).setWithdrawTimeout(3600)
      ).to.satisfy;
    });

    it("Non-admins cannot set reward rate and timeouts", async function () {
      await expect (
        stakingContract.connect(addr1).setWithdrawTimeout(7200)
      ).to.be.revertedWith("You are not the admin!");

      await expect (
        stakingContract.connect(addr1).setRewardRate(ethers.utils.parseEther("100"))
      ).to.be.revertedWith("You are not the admin!");
    })

    it("Owner can unset admin", async function () {
      expect (
        await stakingContract.unsetAdmin(admin.address)
      ).to.satisfy;
    });

  })
});