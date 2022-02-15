import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20Mock, CurveFiSwaps, CurveFiSwaps__factory } from "../typechain";
import { USDC_WHALE, CurveSwapsAddress } from "../constants/addresses";
import { getErc20Balance, impersonateFundErc20 } from "../utils/token";
import { getBigNumber, getERC20ContractFromAddress } from "../utils";
import { ERC20Token } from "../constants/token";

describe("Curve fi", () => {
  let Curve: CurveFiSwaps;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let USDC: ERC20Mock;
  let DAI: ERC20Mock;
  let WBTC: ERC20Mock;

  let fixture: any;

  before(async () => {
    USDC = await getERC20ContractFromAddress(ERC20Token.USDC.address);
    DAI = await getERC20ContractFromAddress(ERC20Token.DAI.address);
    WBTC = await getERC20ContractFromAddress(ERC20Token.WBTC.address);
    fixture = async () => {
      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

      const factory = (await ethers.getContractFactory(
        "CurveFiSwaps"
      )) as CurveFiSwaps__factory;
      Curve = factory.attach(CurveSwapsAddress);
    };
  });

  beforeEach(async () => {
    await fixture();
  });

  describe("get price", async () => {
    it("DAI - USDC", async () => {
      const amountOut = await Curve.get_dy_underlying(0, 1, getBigNumber(1000));
      expect(amountOut.gt(getBigNumber(0))).to.be.true;
    });

    it("USDC - WBTC", async () => {
      const amountOut = await Curve.get_dy_underlying(
        1,
        3,
        getBigNumber(1000, 6)
      );
      expect(amountOut.gt(getBigNumber(0))).to.be.true;
    });

    it("WBTC - WETH", async () => {
      const amountOut = await Curve.get_dy_underlying(3, 4, getBigNumber(1, 8));
      expect(amountOut.gt(getBigNumber(0))).to.be.true;
    });
  });

  describe("exchange", async () => {
    it("USDC - DAI", async () => {
      await impersonateFundErc20(USDC, USDC_WHALE, owner.address, "1000.0", 6);
      await USDC.approve(Curve.address, getBigNumber(10, 6));
      await Curve.exchange_underlying(
        1,
        0,
        getBigNumber(10, 6),
        getBigNumber(9)
      );
      const balance = await DAI.balanceOf(owner.address);
      expect(balance.gt(getBigNumber(9))).to.be.true;
    });

    it("USDC - WBTC", async () => {
      await impersonateFundErc20(USDC, USDC_WHALE, owner.address, "1000.0", 6);
      await USDC.approve(Curve.address, getBigNumber(10, 6));
      await Curve.exchange_underlying(1, 3, getBigNumber(10, 6), 0);
      const balance = await WBTC.balanceOf(owner.address);
      expect(balance.gt(getBigNumber(0))).to.be.true;
    });
  });
});
