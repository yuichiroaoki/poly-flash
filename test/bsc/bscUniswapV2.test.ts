import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20Mock, UniswapFork, UniswapFork__factory } from "../../typechain";
import { BSC_WHALE, bscTokens, uniswapRouter } from "../../constants/bsc";
import { getErc20Balance, impersonateFundErc20 } from "../../utils/token";
import { getPriceOnUniV2 } from "../../utils/v2/getPrice";
import { getBigNumber, getERC20ContractFromAddress } from "../../utils";

describe("Swap on uniswap fork on bsc", () => {
  let Fork: UniswapFork;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let DAI: ERC20Mock;
  let USDC: ERC20Mock;

  let fixture: any;

  before(async () => {
    USDC = await getERC20ContractFromAddress(bscTokens.USDC);
    DAI = await getERC20ContractFromAddress(bscTokens.DAI);

    fixture = async () => {
      [owner, addr2, addr2, ...addrs] = await ethers.getSigners();

      const factory = (await ethers.getContractFactory(
        "UniswapFork",
        owner
      )) as UniswapFork__factory;
      Fork = await factory.deploy();

      await impersonateFundErc20(USDC, BSC_WHALE, Fork.address, "10.0");
    };
  });

  beforeEach(async () => {
    await fixture();
  });

  describe("pancakeswap", async () => {
    it("should execute dai -> usdc swap", async () => {
      const tokenIn = bscTokens.USDC;
      const tokenOut = bscTokens.DAI;
      const amountIn = getBigNumber(1);
      const routerAddress = uniswapRouter.BSC_PANCAKESWAP;
      const expected = await getPriceOnUniV2(
        tokenIn,
        tokenOut,
        amountIn,
        routerAddress
      );
      await expect(
        Fork.uniswapFork(
          routerAddress,
          tokenIn,
          amountIn,
          1,
          [tokenIn, tokenOut],
          Fork.address
        )
      ).not.to.reverted;
      expect((await DAI.balanceOf(Fork.address)).eq(expected)).to.be.true;
    });
  });

  describe("sushiswap", async () => {
    it("should execute dai -> usdc swap", async () => {
      const tokenIn = bscTokens.USDC;
      const tokenOut = bscTokens.DAI;
      const amountIn = getBigNumber(1);
      const routerAddress = uniswapRouter.BSC_SUSHISWAP;
      const expected = await getPriceOnUniV2(
        tokenIn,
        tokenOut,
        amountIn,
        routerAddress
      );
      await expect(
        Fork.uniswapFork(
          routerAddress,
          tokenIn,
          amountIn,
          1,
          [tokenIn, tokenOut],
          Fork.address
        )
      ).not.to.reverted;
      expect((await DAI.balanceOf(Fork.address)).eq(expected)).to.be.true;
    });
  });
});
