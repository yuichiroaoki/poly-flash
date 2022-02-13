import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { dodoV2Pool, erc20Address } from "../constants/addresses";
import { ERC20Mock, Flashloan, Flashloan__factory } from "../typechain";
import {
  deployContractFromName,
  findRouterFromProtocol,
  getBigNumber,
  getERC20ContractFromAddress,
} from "../utils";

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
  });

  describe("Dodo", () => {
    it("should revert flashloan when the flashloan pool address is wrong.", async () => {
      await expect(
        Flashloan.dodoFlashLoan(
          {
            flashLoanPool: dodoV2Pool.WMATIC_WETH,
            loanAmount: getBigNumber(1, 6),
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
      ).to.be.revertedWith("Wrong flashloan pool address");
    });

    it("should revert flashloan with the total route parts error.", async () => {
      await expect(
        Flashloan.dodoFlashLoan(
          {
            flashLoanPool: dodoV2Pool.WMATIC_WETH,
            loanAmount: getBigNumber(1, 6),
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
                    path: [erc20Address.WMATIC, erc20Address.DAI],
                  },
                ],
                part: 10000,
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
                    path: [erc20Address.DAI, erc20Address.USDC],
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
                    path: [erc20Address.USDC, erc20Address.WMATIC],
                  },
                ],
                part: 10000,
              },
            ],
          },
          { gasLimit: 1000000 }
        )
      ).to.be.revertedWith("Route part error");
    });

    it("should revert flashloan with the total route parts error.", async () => {
      await expect(
        Flashloan.dodoFlashLoan(
          {
            flashLoanPool: dodoV2Pool.WMATIC_WETH,
            loanAmount: getBigNumber(1, 6),
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
                      {
                        protocol: 2,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [findRouterFromProtocol(2)]
                        ),
                      },
                    ],
                    path: [erc20Address.WMATIC, erc20Address.DAI],
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
                    path: [erc20Address.DAI, erc20Address.WMATIC],
                  },
                ],
                part: 10000,
              },
            ],
          },
          { gasLimit: 1000000 }
        )
      ).to.be.revertedWith("Swap part error");
    });

    // it("should revert flashloan when you borrow and swap tokens from the same pool.", async () => {
    // 	await expect(
    // 		Flashloan.dodoFlashLoan({
    // 			flashLoanPool: dodoV2Pool.WMATIC_USDC,
    // 			loanAmount: getBigNumber(1, 6),
    // 			firstRoutes: [{
    // 				path: [erc20Address.USDC, erc20Address.WMATIC],
    // 				pool: uniswapRouter.POLYGON_QUICKSWAP,
    // 				protocol: 1,
    // 				fee: []
    // 			}],
    // 			secondRoutes: [{
    // 				path: [erc20Address.WMATIC, erc20Address.USDC],
    // 				pool: dodoV2Pool.WMATIC_USDC,
    // 				protocol: 0,
    // 				fee: []
    // 			}],
    // 		}, { gasLimit: 1000000 })
    // 	).to.be.revertedWith("REENTRANT");
    // });

    // it("should revert flashloan when the dodo pool address is wrong.", async () => {
    // 	await expect(
    // 		Flashloan.dodoFlashLoan({
    // 			flashLoanPool: dodoV2Pool.USDT_DAI,
    // 			loanAmount: getBigNumber(1, 6),
    // 			firstRoutes: [{
    // 				path: [erc20Address.USDT, erc20Address.WETH],
    // 				pool: dodoV2Pool.WMATIC_WETH,
    // 				protocol: 0,
    // 				fee: []
    // 			}],
    // 			secondRoutes: [{
    // 				path: [erc20Address.WETH, erc20Address.DAI],
    // 				pool: uniswapRouter.POLYGON_SUSHISWAP,
    // 				protocol: 1,
    // 				fee: []
    // 			}]
    // 		}, { gasLimit: 1000000 })
    // 	).to.be.revertedWith("Wrong dodo V2 pool address");
    // });
  });

  it("should revert flashloan when it cannot pay back the loan.", async () => {
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
    ).to.be.revertedWith("Not enough amount to return loan");
  });

  it("should be reverted when you input a wrong protocol number.", async () => {
    await expect(
      Flashloan.dodoFlashLoan(
        {
          flashLoanPool: dodoV2Pool.WETH_USDC,
          loanAmount: loanAmount,
          firstRoutes: [
            {
              hops: [
                {
                  swaps: [
                    {
                      protocol: 28,
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
    ).to.be.revertedWith("Wrong protocol");
  });
});
