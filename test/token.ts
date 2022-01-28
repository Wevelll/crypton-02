import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Token , Token__factory } from "../typechain";

describe("Croken contract", function () {
  let Token: Token;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;
  let ownerBalance: BigNumber;

  before(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const tokenFactory = (await ethers.getContractFactory(
      "Token", owner
      )) as Token__factory;

    Token = await tokenFactory.deploy("Croken", "CRK", ethers.utils.parseEther("0"));
  });

  describe("Deployment", function () {
    it("Should assign the total supply of tokens to the owner", async function () {
      ownerBalance = await Token.balanceOf(owner.address);
      expect(await Token.totalSupply()).to.equal(ownerBalance);
    });

    it("Should read token attributes", async function () {
      expect (
        await Token.name()
      ).to.be.equal("Croken");

      expect (
        await Token.symbol()
      ).to.be.equal("CRK");

      expect (
        await Token.decimals()
      ).to.be.equal(18);
    });
  });

  describe("Minting/burning", function () {
    const baseAmount = ethers.utils.parseEther("138840");
    const newAmount = ethers.utils.parseEther("69420");

    it("Owner mints some tokens", async function () {
      await Token._mint(owner.address, baseAmount);
      expect (
        await Token.balanceOf(owner.address)
      ).to.be.equal(baseAmount);
    });

    it("Owner burns some tokens", async function () {
      await Token._burn(owner.address, newAmount);
      expect (
        await Token.balanceOf(owner.address)
      ).to.be.equal(newAmount);
    });

    it("Cannot burn more than balance", async function () {
      await expect (
        Token._burn(owner.address, baseAmount)
      ).to.be.revertedWith("Cannot burn more than balance!");
    })

    it("Others can't mint/burn tokens", async function () {
      await expect (
        Token.connect(addr1)._mint(addr2.address, newAmount)
      ).to.be.revertedWith("You are not the owner!");
      await expect (
         Token.connect(addr2)._burn(owner.address, newAmount)
      ).to.be.revertedWith("You are not the owner!");
    });
  });

  describe("Transactions", function () {
    const balance1 = ethers.utils.parseEther("1337");
    const balance2 = ethers.utils.parseEther("322");

		it("Should transfer tokens between accounts & update balances", async function () {
        await Token.transfer(addr1.address, balance1);
        const addr1Balance = await Token.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(balance1);

        await Token.connect(addr1).transfer(addr2.address, balance2);
        const addr2Balance = await Token.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(balance2);

        await Token.transfer(addr3.address, balance1.add(balance2));
        const addr3Balance = await Token.balanceOf(addr3.address);
        expect(addr3Balance).to.equal(balance1.add(balance2));
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
        const initialOwnerBalance = await Token.balanceOf(owner.address);

        await expect (
          Token.connect(addr2).transfer(owner.address, initialOwnerBalance)
        ).to.be.revertedWith("Insufficient balance!");

        expect(await Token.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });
  });

  describe("Allowance etc.", function () {
    const amount1 = ethers.utils.parseEther("5");
    const amount2 = ethers.utils.parseEther("8");

    it("Should allow addr2 to spend some addr1's tokens", async function () {
      await Token.connect(addr1).approve(addr2.address, amount1);
      expect (
        await Token.allowance(addr1.address, addr2.address)
      ).to.be.equal(amount1);
    });

    it("Should not transfer more than allowed", async function () {
      await expect(
        Token.connect(addr2).transferFrom(addr1.address, addr3.address, amount2)
      ).to.be.revertedWith("Insufficient allowance!")
    });

    it("Should transfer allowed tokens from addr1 by addr2", async function () {
      expect (
        await Token.connect(addr2).transferFrom(addr1.address, addr3.address, amount1)
      ).to.satisfy;
    });
  });
});