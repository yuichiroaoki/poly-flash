import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import * as IERC20 from "../../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";
import { BalancerFlashLoan, BalancerFlashLoan__factory } from "../../typechain";
import { erc20Address } from "../../constants/addresses";
import { Contract } from "@ethersproject/contracts";
import { getBigNumber } from "../../utils";

describe("Balancer flashloan on polygon", () => {
  let Flashloan: BalancerFlashLoan;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let DAI: Contract;

  const provider = ethers.provider;
  const balancerVault = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
  let fixture: any;

  before(async () => {
    fixture = async () => {
      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

      const factory = (await ethers.getContractFactory(
        "BalancerFlashLoan"
      )) as BalancerFlashLoan__factory;
      Flashloan = await factory.deploy(balancerVault);

      await Flashloan.deployed();

      DAI = new ethers.Contract(erc20Address.DAI, IERC20.abi, provider);
    };
  });

  beforeEach(async () => {
    await fixture();
  });

  describe("flashloan", async () => {
    it("should borrow USDC", async () => {
      // borrowing 1 million USDC from balancer V2 vault
      await expect(
        Flashloan.flashLoan(
          [erc20Address.USDC],
          [getBigNumber(1_000_000, 6)],
          "0x"
        )
      ).to.not.reverted;
    });

    it("should borrow USDC and WETH", async () => {
      // borrowing 1 million USDC and 1000 WETH from balancer V2 vault
      await expect(
        Flashloan.flashLoan(
          [erc20Address.USDC, erc20Address.WETH],
          [getBigNumber(1_000_000, 6), getBigNumber(1_000)],
          "0x"
        )
      ).to.not.reverted;
    });
  });
});
