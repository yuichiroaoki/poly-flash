import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { dodoV2Pool } from "../../constants/addresses";
import { ERC20Token } from "../../constants/token";
import { ERC20Mock, Flashloan, Flashloan__factory } from "../../typechain";
import {
  deployContractFromName,
  findRouterFromProtocol,
  getBigNumber,
  getERC20ContractFromAddress,
} from "../../utils";

describe("Flashloan Error Message", () => {
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
  const loanAmount = ethers.BigNumber.from(1000);

  before(async () => {
    USDC = await getERC20ContractFromAddress(ERC20Token.USDC.address);
    USDT = await getERC20ContractFromAddress(ERC20Token.USDT.address);
    DAI = await getERC20ContractFromAddress(ERC20Token.DAI.address);
    WETH = await getERC20ContractFromAddress(ERC20Token.WETH.address);
    WMATIC = await getERC20ContractFromAddress(ERC20Token.WMATIC.address);
  });

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    Flashloan = await deployContractFromName("Flashloan", Flashloan__factory);
    await Flashloan.deployed();
  });

  describe("Dodo", () => {
    it("should revert flashloan when the flashloan pool address is wrong.", async () => {
      await expect(
        Flashloan.dodoFlashLoan(
          {
            flashLoanPool: dodoV2Pool.WMATIC_WETH,
            loanAmount: getBigNumber(1, 6),
            routes: [
              {
                hops: [
                  {
                    protocol: 1,
                    data: ethers.utils.defaultAbiCoder.encode(
                      ["address"],
                      [findRouterFromProtocol(1)]
                    ),
                    path: [ERC20Token.USDC.address, ERC20Token.WETH.address],
                  },
                  {
                    protocol: 1,
                    data: ethers.utils.defaultAbiCoder.encode(
                      ["address"],
                      [findRouterFromProtocol(1)]
                    ),
                    path: [ERC20Token.WETH.address, ERC20Token.USDC.address],
                  },
                ],
                part: 10000,
              },
            ],
          },
          { gasLimit: 1000000 }
        )
      ).to.be.revertedWith("Wrong flashloan pool address");
    });
  });

  it("should revert flashloan when it cannot pay back the loan.", async () => {
    await expect(
      Flashloan.dodoFlashLoan(
        {
          flashLoanPool: dodoV2Pool.WETH_USDC,
          loanAmount: getBigNumber(1000, 6),
          routes: [
            {
              hops: [
                {
                  protocol: 1,
                  data: ethers.utils.defaultAbiCoder.encode(
                    ["address"],
                    [findRouterFromProtocol(1)]
                  ),
                  path: [ERC20Token.USDC.address, ERC20Token.WETH.address],
                },
                {
                  protocol: 1,
                  data: ethers.utils.defaultAbiCoder.encode(
                    ["address"],
                    [findRouterFromProtocol(1)]
                  ),
                  path: [ERC20Token.WETH.address, ERC20Token.USDC.address],
                },
              ],
              part: 10000,
            },
          ],
        },
        { gasLimit: 1000000 }
      )
    ).to.be.revertedWith("Not enough amount to return loan");
  });
});
