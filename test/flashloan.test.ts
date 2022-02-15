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

  describe("UniswapV2", () => {
    it("USDC - WETH", async () => {
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
                        protocol: 1,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(1)]
                        ),
                      },
                    ],
                    path: [erc20Address.USDC, erc20Address.WETH],
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
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(1)]
                        ),
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
    });

    it("USDC - WETH - WBTC", async () => {
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
                        protocol: 1,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(1)]
                        ),
                      },
                    ],
                    path: [ERC20Token.USDC.address, ERC20Token.WETH.address],
                  },
                  {
                    swaps: [
                      {
                        protocol: 2,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(1)]
                        ),
                      },
                    ],
                    path: [ERC20Token.WETH.address, ERC20Token.WBTC.address],
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
                        protocol: 3,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(3)]
                        ),
                      },
                    ],
                    path: [ERC20Token.WBTC.address, ERC20Token.WETH.address],
                  },
                  {
                    swaps: [
                      {
                        protocol: 3,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(3)]
                        ),
                      },
                    ],
                    path: [ERC20Token.WETH.address, ERC20Token.USDC.address],
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

    it("should execute a flashloan with multihop swaps.", async () => {
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
                        protocol: 1,
                        part: 5000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(4)]
                        ),
                      },
                      {
                        protocol: 2,
                        part: 5000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(5)]
                        ),
                      },
                    ],
                    path: [erc20Address.USDC, erc20Address.DAI],
                  },
                  {
                    swaps: [
                      {
                        protocol: 2,
                        part: 9000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(1)]
                        ),
                      },
                      {
                        protocol: 3,
                        part: 1000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(2)]
                        ),
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
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(3)]
                        ),
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
    it("should execute uniswapV3 flashloan.", async () => {
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
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address", "uint24"],
                          [findRouterFromProtocol(0), 500]
                        ),
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

    it("USDC - WETH - UNI", async () => {
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
                    path: [ERC20Token.USDC.address, ERC20Token.WETH.address],
                  },
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
                    path: [ERC20Token.WETH.address, ERC20Token.UNI.address],
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
                          [findRouterFromProtocol(0), 3000]
                        ),
                      },
                    ],
                    path: [ERC20Token.UNI.address, ERC20Token.WETH.address],
                  },
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
                    path: [ERC20Token.WETH.address, ERC20Token.USDC.address],
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

    it("should execute uniswapV3 flashloan with multiple swaps.", async () => {
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
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address", "uint24"],
                          [findRouterFromProtocol(0), 500]
                        ),
                      },
                      {
                        protocol: 1,
                        part: 2500,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(1)]
                        ),
                      },
                      {
                        protocol: 2,
                        part: 1000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(2)]
                        ),
                      },
                      {
                        protocol: 3,
                        part: 825,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(3)]
                        ),
                      },
                      {
                        protocol: 4,
                        part: 675,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(4)]
                        ),
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
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address", "uint24"],
                          [findRouterFromProtocol(0), 500]
                        ),
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

    it("should execute uniswapV3 flashloan with multiple routes.", async () => {
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
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(1)]
                        ),
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
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address", "uint24"],
                          [findRouterFromProtocol(0), 500]
                        ),
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

  describe("DODO", () => {
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
                        protocol: 8,
                        part: 10000,

                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address", "address", "address"],
                          [
                            dodoV2Pool.USDC_DAI,
                            DODOApprove.Polygon,
                            DODOV2Proxy.Polygon,
                          ]
                        ),
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

    it("USDC - WMATIC", async () => {
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
                    path: [erc20Address.USDC, erc20Address.WMATIC],
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
                        protocol: 8,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address", "address", "address"],
                          [
                            dodoV2Pool.WMATIC_USDC,
                            DODOApprove.Polygon,
                            DODOV2Proxy.Polygon,
                          ]
                        ),
                      },
                    ],
                    path: [erc20Address.WMATIC, erc20Address.USDC],
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
                        protocol: 8,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address", "address", "address"],
                          [
                            dodoV2Pool.USDC_DAI,
                            DODOApprove.Polygon,
                            DODOV2Proxy.Polygon,
                          ]
                        ),
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
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address", "uint24"],
                          [findRouterFromProtocol(0), 500]
                        ),
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

    it("USDC - USDT - DAI", async () => {
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
                        protocol: 8,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address", "address", "address"],
                          [
                            dodoV2Pool.USDC_USDT,
                            DODOApprove.Polygon,
                            DODOV2Proxy.Polygon,
                          ]
                        ),
                      },
                    ],
                    path: [erc20Address.USDC, erc20Address.USDT],
                  },
                  {
                    swaps: [
                      {
                        protocol: 8,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address", "address", "address"],
                          [
                            dodoV2Pool.USDT_DAI,
                            DODOApprove.Polygon,
                            DODOV2Proxy.Polygon,
                          ]
                        ),
                      },
                    ],
                    path: [erc20Address.USDT, erc20Address.DAI],
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

  describe("Curve", () => {
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
