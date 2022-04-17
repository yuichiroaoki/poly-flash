import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20Mock, UniswapFork, UniswapFork__factory } from "../typechain";
import {
  USDC_WHALE,
  erc20Address,
  uniswapRouter,
} from "../constants/addresses";
import { getErc20Balance, impersonateFundErc20 } from "../utils/token";
import { getPriceOnUniV2 } from "../utils/v2/getPrice";
import { getBigNumber, getERC20ContractFromAddress } from "../utils";

describe("Swap on uniswap fork on polygon", () => {
  let Fork: UniswapFork;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let DAI: ERC20Mock;
  let USDC: ERC20Mock;
  let USDT: ERC20Mock;
  let WETH: ERC20Mock;
  let WMATIC: ERC20Mock;

  let fixture: any;

  before(async () => {
    USDC = await getERC20ContractFromAddress(erc20Address.USDC);
    USDT = await getERC20ContractFromAddress(erc20Address.USDT);
    DAI = await getERC20ContractFromAddress(erc20Address.DAI);
    WETH = await getERC20ContractFromAddress(erc20Address.WETH);
    WMATIC = await getERC20ContractFromAddress(erc20Address.WMATIC);

    fixture = async () => {
      [owner, addr2, addr2, ...addrs] = await ethers.getSigners();

      const factory = (await ethers.getContractFactory(
        "UniswapFork",
        owner
      )) as UniswapFork__factory;
      Fork = await factory.deploy();

      await impersonateFundErc20(DAI, USDC_WHALE, Fork.address, "100.0");
      await impersonateFundErc20(USDC, USDC_WHALE, Fork.address, "100.0", 6);
    };
  });

  beforeEach(async () => {
    await fixture();
  });

  describe("quickswap", async () => {
    it("should execute dai -> usdc swap", async () => {
      const tokenIn = erc20Address.DAI;
      const tokenOut = erc20Address.USDC;
      const amountIn = getBigNumber(1);
      const routerAddress = uniswapRouter.POLYGON_QUICKSWAP;
      const expected = await getPriceOnUniV2(
        tokenIn,
        tokenOut,
        amountIn,
        routerAddress
      );
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_QUICKSWAP,
          tokenIn,
          amountIn,
          1,
          [tokenIn, tokenOut],
          Fork.address
        )
      ).to.not.reverted;
      expect((await USDC.balanceOf(Fork.address)).eq(expected)).to.be.true;
    });

    it("should swap multihop usdc -> dai", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_QUICKSWAP,
          erc20Address.USDC,
          getBigNumber(1, 6),
          1,
          [erc20Address.USDC, erc20Address.DAI],
          Fork.address
        )
      ).to.not.reverted;
    });

    it("should execute dai -> wmatic swap with multihop", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_QUICKSWAP,
          erc20Address.DAI,
          getBigNumber(100),
          1,
          [erc20Address.DAI, erc20Address.USDT, erc20Address.WMATIC],
          Fork.address
        )
      ).to.not.reverted;
    });
  });

  describe("sushiswap", async () => {
    it("should execute dai -> usdc swap", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_SUSHISWAP,
          erc20Address.DAI,
          getBigNumber(1),
          1,
          [erc20Address.DAI, erc20Address.USDC],
          Fork.address
        )
      ).to.not.reverted;
    });

    it("should execute usdc -> dai swap", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_SUSHISWAP,
          erc20Address.USDC,
          getBigNumber(1, 6),
          1,
          [erc20Address.USDC, erc20Address.DAI],
          Fork.address
        )
      ).to.not.reverted;
    });

    it("should execute dai -> wmatic swap with multihop", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_SUSHISWAP,
          erc20Address.DAI,
          getBigNumber(100),
          1,
          [erc20Address.DAI, erc20Address.USDT, erc20Address.WMATIC],
          Fork.address
        )
      ).to.not.reverted;
    });
  });

  describe("waultswap", async () => {
    it("should execute dai -> usdc swap", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_WAULTSWAP,
          erc20Address.DAI,
          getBigNumber(1),
          1,
          [erc20Address.DAI, erc20Address.USDC],
          Fork.address
        )
      ).to.not.reverted;
    });

    it("should execute usdc -> dai swap", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_WAULTSWAP,
          erc20Address.USDC,
          getBigNumber(1, 6),
          1,
          [erc20Address.USDC, erc20Address.DAI],
          Fork.address
        )
      ).to.not.reverted;
    });

    it("should execute dai -> wmatic swap with multihop", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_WAULTSWAP,
          erc20Address.DAI,
          getBigNumber(100),
          1,
          [erc20Address.DAI, erc20Address.USDT, erc20Address.WMATIC],
          Fork.address
        )
      ).to.not.reverted;
    });
  });

  describe("jetswap", async () => {
    it("should execute dai -> usdc swap", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_JETSWAP,
          erc20Address.DAI,
          getBigNumber(1),
          1,
          [erc20Address.DAI, erc20Address.USDC],
          Fork.address
        )
      ).to.not.reverted;
    });

    it("should execute usdc -> dai swap", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_JETSWAP,
          erc20Address.USDC,
          getBigNumber(1, 6),
          1,
          [erc20Address.USDC, erc20Address.DAI],
          Fork.address
        )
      ).to.not.reverted;
    });

    it("should execute dai -> wmatic swap with multihop", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_JETSWAP,
          erc20Address.DAI,
          getBigNumber(100),
          1,
          [erc20Address.DAI, erc20Address.USDC, erc20Address.WMATIC],
          Fork.address
        )
      ).to.not.reverted;
    });
  });

  describe("apeswap", async () => {
    it("should execute dai -> usdc swap", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_APESWAP,
          erc20Address.DAI,
          getBigNumber(1),
          1,
          [erc20Address.DAI, erc20Address.USDC],
          Fork.address
        )
      ).to.not.reverted;
    });

    it("should execute usdc -> dai swap", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_APESWAP,
          erc20Address.USDC,
          getBigNumber(1, 6),
          1,
          [erc20Address.USDC, erc20Address.DAI],
          Fork.address
        )
      ).to.not.reverted;
    });

    it("should execute dai -> wmatic swap with multihop", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_APESWAP,
          erc20Address.DAI,
          getBigNumber(100),
          1,
          [erc20Address.DAI, erc20Address.USDT, erc20Address.WMATIC],
          Fork.address
        )
      ).to.not.reverted;
    });
  });

  describe("polycat", async () => {
    it("should execute dai -> usdc swap", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_POLYCAT,
          erc20Address.DAI,
          getBigNumber(1),
          1,
          [erc20Address.DAI, erc20Address.USDC],
          Fork.address
        )
      ).to.not.reverted;
    });

    it("should execute usdc -> dai swap", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_POLYCAT,
          erc20Address.USDC,
          getBigNumber(1, 6),
          1,
          [erc20Address.USDC, erc20Address.DAI],
          Fork.address
        )
      ).to.not.reverted;
    });

    it("should execute dai -> wmatic swap with multihop", async () => {
      await expect(
        Fork.uniswapFork(
          uniswapRouter.POLYGON_POLYCAT,
          erc20Address.DAI,
          getBigNumber(100),
          1,
          [erc20Address.DAI, erc20Address.USDT, erc20Address.WMATIC],
          Fork.address
        )
      ).to.not.reverted;
    });
  });
});
