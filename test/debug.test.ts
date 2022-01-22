import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import {
  dodoV2Pool,
  erc20Address,
  uniswapRouter,
  USDC_WHALE,
  UniswapV3poolFee,
} from "../constants/addresses";
import {
  ERC20Mock,
  Router,
  Flashloan,
  Flashloan__factory,
  Router__factory,
} from "../typechain";
import {
  deployContractFromName,
  getBigNumber,
  getERC20ContractFromAddress,
} from "../utils";
import { impersonateFundErc20 } from "../utils/token";

describe("Flashloan", () => {
  let Router: Router;
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

    const factory = (await ethers.getContractFactory(
      "Router",
      owner
    )) as Router__factory;
    Router = (await upgrades.deployProxy(
      factory,
      [Object.values(uniswapRouter), UniswapV3poolFee],
      {
        initializer: "initialize",
      }
    )) as Router;
    await Router.deployed();
  });

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    Flashloan = await deployContractFromName("Debug", Flashloan__factory, [
      Router.address,
    ]);
    await Flashloan.deployed();
  });

  describe("UniswapV2", () => {
    it("should execute a flashloan with multihop swaps.", async () => {
      await impersonateFundErc20(USDC, USDC_WHALE, Flashloan.address, "1.0", 6);
      expect((await DAI.balanceOf(Flashloan.address)).eq(getBigNumber(0))).to.be
        .true;
      expect((await WETH.balanceOf(Flashloan.address)).eq(getBigNumber(0))).to
        .be.true;
      await expect(
        Flashloan.dodoFlashLoan(
          {
            flashLoanPool: dodoV2Pool.WETH_USDC,
            loanAmount: getBigNumber(1, 6),
            firstRoutes: [
              {
                hops: [
                  {
                    swaps: [
                      {
                        protocol: 1,
                        part: 5000,
                      },
                      {
                        protocol: 2,
                        part: 5000,
                      },
                    ],
                    path: [erc20Address.USDC, erc20Address.DAI],
                  },
                  {
                    swaps: [
                      {
                        protocol: 2,
                        part: 9000,
                      },
                      {
                        protocol: 3,
                        part: 1000,
                      },
                    ],
                    path: [erc20Address.DAI, erc20Address.WETH],
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
                        protocol: 1,
                        part: 10000,
                      },
                    ],
                    path: [erc20Address.WETH, erc20Address.USDC],
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
      expect(
        (await DAI.balanceOf(Flashloan.address)).lt(ethers.BigNumber.from(1000))
      ).to.be.true;
      expect(
        (await WETH.balanceOf(Flashloan.address)).lt(
          ethers.BigNumber.from(1000)
        )
      ).to.be.true;
    });
  });

  describe("UniswapV3", () => {
    xit("should execute uniswapV3 flashloan.", async () => {
      await impersonateFundErc20(USDC, USDC_WHALE, Flashloan.address, "1.0", 6);
      await expect(
        Flashloan.dodoFlashLoan(
          {
            flashLoanPool: dodoV2Pool.WETH_USDC,
            loanAmount: getBigNumber(1, 6),
            firstRoutes: [
              {
                hops: [
                  {
                    swaps: [
                      {
                        protocol: 0,
                        part: 10000,
                      },
                    ],
                    path: [erc20Address.USDC, erc20Address.DAI],
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
                      },
                    ],
                    path: [erc20Address.DAI, erc20Address.USDC],
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

    xit("should execute uniswapV3 flashloan with multiple swaps.", async () => {
      await impersonateFundErc20(
        USDC,
        USDC_WHALE,
        Flashloan.address,
        "1000.0",
        6
      );
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
                        part: 5000,
                      },
                      {
                        protocol: 1,
                        part: 2500,
                      },
                      {
                        protocol: 2,
                        part: 1000,
                      },
                      {
                        protocol: 3,
                        part: 825,
                      },
                      {
                        protocol: 4,
                        part: 675,
                      },
                    ],
                    path: [erc20Address.USDC, erc20Address.DAI],
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
                      },
                    ],
                    path: [erc20Address.DAI, erc20Address.USDC],
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
      expect((await DAI.balanceOf(Flashloan.address)).eq(getBigNumber(0))).to.be
        .true;
    });

    xit("should execute uniswapV3 flashloan with multiple routes.", async () => {
      await impersonateFundErc20(
        USDC,
        USDC_WHALE,
        Flashloan.address,
        "10.0",
        6
      );
      await expect(
        Flashloan.dodoFlashLoan(
          {
            flashLoanPool: dodoV2Pool.WETH_USDC,
            loanAmount: getBigNumber(10, 6),
            firstRoutes: [
              {
                hops: [
                  {
                    swaps: [
                      {
                        protocol: 0,
                        part: 10000,
                      },
                    ],
                    path: [erc20Address.USDC, erc20Address.DAI],
                  },
                ],
                part: 9000,
              },
              {
                hops: [
                  {
                    swaps: [
                      {
                        protocol: 1,
                        part: 10000,
                      },
                    ],
                    path: [erc20Address.USDC, erc20Address.DAI],
                  },
                ],
                part: 1000,
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
                      },
                    ],
                    path: [erc20Address.DAI, erc20Address.USDC],
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
      expect((await DAI.balanceOf(Flashloan.address)).eq(getBigNumber(0))).to.be
        .true;
    });
  });
});
