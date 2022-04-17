import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { erc20Address, USDC_WHALE } from "../constants/addresses";
import { ERC20Mock, Flashloan, Flashloan__factory } from "../typechain";
import {
  deployContractFromName,
  getBigNumber,
  getERC20ContractFromAddress,
} from "../utils";
import { impersonateFundErc20 } from "../utils/token";

describe("Access", () => {
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

  describe("Withdraw", () => {
    it("should withdraw tokens", async () => {
      await expect(
        Flashloan.withdrawToken(USDC.address, addr1.address, getBigNumber(1, 6))
      )
        .emit(Flashloan, "Withdrawal")
        .withArgs(addr1.address, getBigNumber(1, 6));
      const balance = await USDC.balanceOf(addr1.address);
      expect(balance.eq(getBigNumber(1, 6))).to.be.true;
    });

    it("should be reverted when there's not enough tokens.", async () => {
      await expect(
        Flashloan.withdrawToken(
          USDC.address,
          addr1.address,
          getBigNumber(10000, 6)
        )
      ).to.be.revertedWith("Not enough token");
    });

    it("should be reverted when non-owner call withdrawToken function", async () => {
      await expect(
        Flashloan.connect(addr1).withdrawToken(
          USDC.address,
          addr1.address,
          getBigNumber(10, 6)
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
