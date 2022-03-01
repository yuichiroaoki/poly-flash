import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20Mock, CurveSwap, CurveSwap__factory } from "../typechain";
import { USDC_WHALE, CurveSwapsAddress } from "../constants/addresses";
import { getErc20Balance, impersonateFundErc20 } from "../utils/token";
import {
  deployContractFromName,
  getBigNumber,
  getERC20ContractFromAddress,
} from "../utils";
import { ERC20Token } from "../constants/token";

describe("Curve fi", () => {
  let Curve: CurveSwap;
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

      Curve = await deployContractFromName("CurveSwap", CurveSwap__factory);
      await Curve.deployed();
      await impersonateFundErc20(USDC, USDC_WHALE, Curve.address, "1000.0", 6);
      await impersonateFundErc20(DAI, USDC_WHALE, Curve.address, "1000.0", 18);
    };
  });

  beforeEach(async () => {
    await fixture();
  });

  describe("exchange", async () => {
    it("USDC - DAI", async () => {
      await Curve.curveFiSwap(
        ethers.utils.defaultAbiCoder.encode(
          ["uint256", "uint256", "address"],
          [1, 0, CurveSwapsAddress]
        ),
        getBigNumber(1000, 6),
        [ERC20Token.USDC.address, ERC20Token.DAI.address]
      );
      const balance = await DAI.balanceOf(Curve.address);
      expect(balance.gt(getBigNumber(9))).to.be.true;
    });

    it("DAI - USDC", async () => {
      await Curve.curveFiSwap(
        ethers.utils.defaultAbiCoder.encode(
          ["uint256", "uint256", "address"],
          [0, 1, CurveSwapsAddress]
        ),
        getBigNumber(1000),
        [ERC20Token.DAI.address, ERC20Token.USDC.address]
      );
      const balance = await USDC.balanceOf(Curve.address);
      expect(balance.gt(getBigNumber(9, 6))).to.be.true;
    });
  });
});
