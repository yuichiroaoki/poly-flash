import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  CurveSwapsAddress,
  DODOApprove,
  dodoV2Pool,
  DODOV2Proxy,
  erc20Address,
  USDC_WHALE,
} from "../constants/addresses";
import { ERC20Token } from "../constants/token";
import { ERC20Mock, Flashloan, Flashloan__factory } from "../typechain";
import {
  deployContractFromName,
  findRouterFromProtocol,
  getBigNumber,
  getERC20ContractFromAddress,
} from "../utils";
import { impersonateFundErc20 } from "../utils/token";

describe("Flashloan", () => {
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

  describe("Curve", () => {
    it("USDC - DAI", async () => {
      await expect(
        Flashloan.dodoFlashLoan(
          {
            flashLoanPool: dodoV2Pool.WETH_USDC,
            loanAmount: getBigNumber(1000, 6),
            firstRoutes: [
              {
                hops: [
                  {
                    swaps: [
                      {
                        protocol: 9,
                        part: 10000,

                        data: ethers.utils.defaultAbiCoder.encode(
                          ["uint256", "uint256", "address"],
                          [1, 0, CurveSwapsAddress]
                        ),
                      },
                    ],
                    path: [ERC20Token.USDC.address, ERC20Token.DAI.address],
                  },
                ],
                part: 10000,
              },
            ],
            secondRoutes: [
              {
                hops: [
                  {
                    swaps: [
                      {
                        protocol: 0,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address", "uint24"],
                          [findRouterFromProtocol(0), 500]
                        ),
                      },
                    ],
                    path: [ERC20Token.DAI.address, ERC20Token.USDC.address],
                  },
                ],
                part: 10000,
              },
            ],
          },
          { gasLimit: 1000000 }
        )
      )
        .emit(Flashloan, "SwapFinished")
        .emit(Flashloan, "SentProfit");
      const balance = await USDC.balanceOf(owner.address);
      expect(balance.gt(getBigNumber(0))).to.be.true;
    });

    it("USDC - DAI", async () => {
      await expect(
        Flashloan.dodoFlashLoan(
          {
            flashLoanPool: dodoV2Pool.WETH_USDC,
            loanAmount: getBigNumber(1000, 6),
            firstRoutes: [
              {
                hops: [
                  {
                    swaps: [
                      {
                        protocol: 0,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address", "uint24"],
                          [findRouterFromProtocol(0), 500]
                        ),
                      },
                    ],
                    path: [ERC20Token.USDC.address, ERC20Token.DAI.address],
                  },
                ],
                part: 10000,
              },
            ],
            secondRoutes: [
              {
                hops: [
                  {
                    swaps: [
                      {
                        protocol: 9,
                        part: 10000,

                        data: ethers.utils.defaultAbiCoder.encode(
                          ["uint256", "uint256", "address"],
                          [0, 1, CurveSwapsAddress]
                        ),
                      },
                    ],
                    path: [ERC20Token.DAI.address, ERC20Token.USDC.address],
                  },
                ],
                part: 10000,
              },
            ],
          },
          { gasLimit: 1000000 }
        )
      )
        .emit(Flashloan, "SwapFinished")
        .emit(Flashloan, "SentProfit");
      const balance = await USDC.balanceOf(owner.address);
      expect(balance.gt(getBigNumber(0))).to.be.true;
    });

    it("USDC - WBTC", async () => {
      await expect(
        Flashloan.dodoFlashLoan(
          {
            flashLoanPool: dodoV2Pool.WETH_USDC,
            loanAmount: getBigNumber(1000, 6),
            firstRoutes: [
              {
                hops: [
                  {
                    swaps: [
                      {
                        protocol: 0,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address", "uint24"],
                          [findRouterFromProtocol(0), 3000]
                        ),
                      },
                    ],
                    path: [ERC20Token.USDC.address, ERC20Token.WBTC.address],
                  },
                ],
                part: 10000,
              },
            ],
            secondRoutes: [
              {
                hops: [
                  {
                    swaps: [
                      {
                        protocol: 9,
                        part: 10000,

                        data: ethers.utils.defaultAbiCoder.encode(
                          ["uint256", "uint256", "address"],
                          [3, 1, CurveSwapsAddress]
                        ),
                      },
                    ],
                    path: [ERC20Token.WBTC.address, ERC20Token.USDC.address],
                  },
                ],
                part: 10000,
              },
            ],
          },
          { gasLimit: 1000000 }
        )
      )
        .emit(Flashloan, "SwapFinished")
        .emit(Flashloan, "SentProfit");
      const balance = await USDC.balanceOf(owner.address);
      expect(balance.gt(getBigNumber(0))).to.be.true;
    });
  });
});
