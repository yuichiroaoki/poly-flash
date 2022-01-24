import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { erc20Address, uniswapRouter } from "../constants/addresses";
import { Router, Router__factory } from "../typechain";

describe("Router", () => {
  let Router: Router;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const factory = (await ethers.getContractFactory(
      "Router"
    )) as Router__factory;
    Router = factory.attach("0x112Aae1218E91392293cb3E63d4f9E7C9c376d2c");
  });

  describe("Access Control", () => {
    it("should be able to get the owner address", async () => {
      expect(await Router.owner()).to.equal(
        "0xB0fD1307c2e0d088424fa4939F53303974421924"
      );
    });

    it("should not update a pool fee.", async () => {
      expect(await Router.getFee(erc20Address.WMATIC, erc20Address.USDC)).to.eq(
        ethers.BigNumber.from(500)
      );
      await expect(
        Router.connect(addr1).updateFee(
          erc20Address.WMATIC,
          erc20Address.USDC,
          3000
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  it("should get a router address.", async () => {
    expect(await Router.getRouterAddress(2)).to.eq(
      uniswapRouter.POLYGON_QUICKSWAP
    );
  });

  it("should get a uniswapV3 router address.", async () => {
    expect(await Router.getRouterAddress(0)).to.eq(
      uniswapRouter.POLYGON_UNISWAP_V3
    );
  });

  it("should get a pool fee.", async () => {
    expect(await Router.getFee(erc20Address.USDC, erc20Address.DAI)).to.eq(
      ethers.BigNumber.from(500)
    );
    expect(await Router.getFee(erc20Address.WMATIC, erc20Address.WETH)).to.eq(
      ethers.BigNumber.from(500)
    );
  });

  it("should update a pool fee.", async () => {
    expect(await Router.getFee(erc20Address.WMATIC, erc20Address.USDC)).to.eq(
      ethers.BigNumber.from(500)
    );
  });

  it("should update a pool fee.", async () => {
    expect(await Router.getFee(erc20Address.WMATIC, erc20Address.USDC)).to.eq(
      ethers.BigNumber.from(500)
    );
  });
});
