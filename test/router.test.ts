import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
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
      "Router",
      owner
    )) as Router__factory;
    Router = (await upgrades.deployProxy(factory, [
      Object.values(uniswapRouter),
      [
        {base: erc20Address.DAI, quote: erc20Address.USDC, fee: 500},
        {base: erc20Address.DAI, quote: erc20Address.USDT, fee: 500},
        {base: erc20Address.WMATIC, quote: erc20Address.USDC, fee: 500},
      ]
    ], {
      initializer: "initialize",
    })) as Router;
    await Router.deployed();
  });

  it("should get a router address.", async () => {
    expect(await Router.getRouterAddress(1)).to.eq(uniswapRouter.POLYGON_QUICKSWAP);
  });

  it("should get a pool fee.", async () => {
    await Router.updateFee(erc20Address.WETH, erc20Address.WMATIC, 500);
    expect(await Router.getFee(erc20Address.USDC, erc20Address.DAI)).to.eq(ethers.BigNumber.from(500));
    expect(await Router.getFee(erc20Address.WMATIC, erc20Address.WETH)).to.eq(ethers.BigNumber.from(500));
  });
});
