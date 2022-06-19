import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  AaveFlashloan,
  AaveFlashloan__factory,
  ERC20Mock,
} from "../../typechain";
import {
  aavePoolAddressesProvider,
  USDC_WHALE,
} from "../../constants/addresses";
import { getBigNumber, getERC20ContractFromAddress } from "../../utils";
import { ERC20Token } from "../../constants/token";
import { getErc20Balance, impersonateFundErc20 } from "../../utils/token";

describe("Aave flashloan on polygon", () => {
  let Flashloan: AaveFlashloan;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let USDC: ERC20Mock;

  let fixture: any;

  before(async () => {
    fixture = async () => {
      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

      const factory = (await ethers.getContractFactory(
        "AaveFlashloan"
      )) as AaveFlashloan__factory;
      Flashloan = await factory.deploy(aavePoolAddressesProvider);

      await Flashloan.deployed();

      USDC = await getERC20ContractFromAddress(ERC20Token.USDC.address);

      // Add 500 USDC to the flashloan contract to pay the flashloan fee
      await impersonateFundErc20(
        USDC,
        USDC_WHALE,
        Flashloan.address,
        "500.0",
        6
      );
    };
  });

  beforeEach(async () => {
    await fixture();
  });

  describe("Aave flashloan", async () => {
    it("should execute flashloan", async () => {
      const loanAmount = getBigNumber(1_000_000, 6);
      // borrowing 1,000,000 USDC from Aave V3 pool
      await expect(Flashloan.aaveFlashloan(ERC20Token.USDC.address, loanAmount))
        .to.not.reverted;

      // check USDC balance of the flashloan contract after flashloan
      await getErc20Balance(USDC, Flashloan.address, "USDC", 6);
    });
  });
});
