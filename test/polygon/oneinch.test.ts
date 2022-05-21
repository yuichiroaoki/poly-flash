import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  dodoV2Pool,
  erc20Address,
  USDC_WHALE,
} from "../../constants/addresses";
import { ERC20Token } from "../../constants/token";
import { ERC20Mock, Flashloan, Flashloan__factory } from "../../typechain";
import {
  deployContractFromName,
  getBigNumber,
  getERC20ContractFromAddress,
} from "../../utils";
import { impersonateFundErc20 } from "../../utils/token";
import { oneinchRoutes } from "../../utils/1inch";

describe("Flashloan with 1inch routes", () => {
  let Flashloan: Flashloan;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let DAI: ERC20Mock;
  let USDC: ERC20Mock;
  let WMATIC: ERC20Mock;
  let WETH: ERC20Mock;
  let USDT: ERC20Mock;

  before(async () => {
    USDC = await getERC20ContractFromAddress(erc20Address.USDC);
    USDT = await getERC20ContractFromAddress(erc20Address.USDT);
    DAI = await getERC20ContractFromAddress(erc20Address.DAI);
    WETH = await getERC20ContractFromAddress(erc20Address.WETH);
    WMATIC = await getERC20ContractFromAddress(erc20Address.WMATIC);
  });

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    Flashloan = await deployContractFromName("Flashloan", Flashloan__factory);
    await Flashloan.deployed();
    await impersonateFundErc20(
      USDC,
      USDC_WHALE,
      Flashloan.address,
      "1000.0",
      6
    );
  });

  describe("UniswapV2", () => {
    it("USDC - WETH", async () => {
      const [firstRoutes, secondRoutes] = await oneinchRoutes(
        ERC20Token.USDC,
        ERC20Token.WETH,
        1000
      );
      if (firstRoutes && secondRoutes) {
        await expect(
          Flashloan.dodoFlashLoan({
            flashLoanPool: dodoV2Pool.WETH_USDC,
            loanAmount: getBigNumber(1000, 6),
            firstRoutes: firstRoutes,
            secondRoutes: secondRoutes,
          })
        )
          .emit(Flashloan, "SwapFinished")
          .emit(Flashloan, "SentProfit");
        const balance = await USDC.balanceOf(owner.address);
        expect(balance.gt(getBigNumber(0))).to.be.true;
      }
    });

    it("USDC - WETH - WBTC", async () => {
      const [firstRoutes, secondRoutes] = await oneinchRoutes(
        ERC20Token.USDC,
        ERC20Token.WETH,
        1000
      );
      if (firstRoutes && secondRoutes) {
        await expect(
          Flashloan.dodoFlashLoan(
            {
              flashLoanPool: dodoV2Pool.WETH_USDC,
              loanAmount: getBigNumber(1000, 6),
              firstRoutes: firstRoutes,
              secondRoutes: secondRoutes,
            },
            { gasLimit: 1000000 }
          )
        )
          .emit(Flashloan, "SwapFinished")
          .emit(Flashloan, "SentProfit");
        const balance = await USDC.balanceOf(owner.address);
        expect(balance.gt(getBigNumber(0))).to.be.true;
      }
    });

    it("should execute a flashloan with multihop swaps.", async () => {
      const [firstRoutes, secondRoutes] = await oneinchRoutes(
        ERC20Token.USDC,
        ERC20Token.WETH,
        1000
      );
      if (firstRoutes && secondRoutes) {
        await expect(
          Flashloan.dodoFlashLoan({
            flashLoanPool: dodoV2Pool.WETH_USDC,
            loanAmount: getBigNumber(1000, 6),
            firstRoutes: firstRoutes,
            secondRoutes: secondRoutes,
          })
        )
          .emit(Flashloan, "SwapFinished")
          .emit(Flashloan, "SentProfit");
        const balance = await USDC.balanceOf(owner.address);
        expect(balance.gt(getBigNumber(0))).to.be.true;
        expect(
          (await DAI.balanceOf(Flashloan.address)).lt(
            ethers.BigNumber.from(1000)
          )
        ).to.be.true;
        expect(
          (await WETH.balanceOf(Flashloan.address)).lt(
            ethers.BigNumber.from(1000)
          )
        ).to.be.true;
      }
    });
  });

  describe("UniswapV3", () => {
    it("should execute uniswapV3 flashloan.", async () => {
      const [firstRoutes, secondRoutes] = await oneinchRoutes(
        ERC20Token.USDC,
        ERC20Token.WETH,
        1000
      );
      if (firstRoutes && secondRoutes) {
        await expect(
          Flashloan.dodoFlashLoan(
            {
              flashLoanPool: dodoV2Pool.WETH_USDC,
              loanAmount: getBigNumber(1000, 6),
              firstRoutes: firstRoutes,
              secondRoutes: secondRoutes,
            },
            { gasLimit: 1000000 }
          )
        )
          .emit(Flashloan, "SwapFinished")
          .emit(Flashloan, "SentProfit");
        const balance = await USDC.balanceOf(owner.address);
        expect(balance.gt(getBigNumber(0))).to.be.true;
      }
    });

    it("USDC - WETH - UNI", async () => {
      const [firstRoutes, secondRoutes] = await oneinchRoutes(
        ERC20Token.USDC,
        ERC20Token.WETH,
        1000
      );
      if (firstRoutes && secondRoutes) {
        await expect(
          Flashloan.dodoFlashLoan(
            {
              flashLoanPool: dodoV2Pool.WETH_USDC,
              loanAmount: getBigNumber(1000, 6),
              firstRoutes: firstRoutes,
              secondRoutes: secondRoutes,
            },
            { gasLimit: 1000000 }
          )
        )
          .emit(Flashloan, "SwapFinished")
          .emit(Flashloan, "SentProfit");
        const balance = await USDC.balanceOf(owner.address);
        expect(balance.gt(getBigNumber(0))).to.be.true;
      }
    });

    it("should execute uniswapV3 flashloan with multiple swaps.", async () => {
      const [firstRoutes, secondRoutes] = await oneinchRoutes(
        ERC20Token.USDC,
        ERC20Token.WETH,
        1000
      );
      if (firstRoutes && secondRoutes) {
        await expect(
          Flashloan.dodoFlashLoan(
            {
              flashLoanPool: dodoV2Pool.WETH_USDC,
              loanAmount: getBigNumber(1000, 6),
              firstRoutes: firstRoutes,
              secondRoutes: secondRoutes,
            },
            { gasLimit: 1000000 }
          )
        )
          .emit(Flashloan, "SwapFinished")
          .emit(Flashloan, "SentProfit");
        const balance = await USDC.balanceOf(owner.address);
        expect(balance.gt(getBigNumber(0))).to.be.true;
        expect((await DAI.balanceOf(Flashloan.address)).eq(getBigNumber(0))).to
          .be.true;
      }
    });
  });
});
