import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  uniswapRouter,
  dodoV2Pool,
  BSC_WHALE,
  bscTokens,
} from "../../constants/bsc";
import { ERC20Mock, Flashloan, Flashloan__factory } from "../../typechain";
import {
  deployContractFromName,
  findRouterFromProtocol,
  getBigNumber,
  getERC20ContractFromAddress,
} from "../../utils";
import { impersonateFundErc20 } from "../../utils/token";

describe("Flashloan on BSC", () => {
  let Flashloan: Flashloan;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let DAI: ERC20Mock;
  let BUSD: ERC20Mock;
  let USDC: ERC20Mock;
  let WETH: ERC20Mock;
  let USDT: ERC20Mock;

  before(async () => {
    BUSD = await getERC20ContractFromAddress(bscTokens.BUSD);
    // USDC = await getERC20ContractFromAddress(bscTokens.USDC);
    // USDT = await getERC20ContractFromAddress(bscTokens.USDT);
    // DAI = await getERC20ContractFromAddress(bscTokens.DAI);
    // WETH = await getERC20ContractFromAddress(bscTokens.WETH);
  });

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    Flashloan = await deployContractFromName("Flashloan", Flashloan__factory);
    await Flashloan.deployed();
    await impersonateFundErc20(BUSD, BSC_WHALE, Flashloan.address, "1000.0");
  });

  describe("UniswapV2", () => {
    it("BUSD - USDC - BUSD", async () => {
      await expect(
        Flashloan.dodoFlashLoan(
          {
            flashLoanPool: dodoV2Pool.ETH_BUSD,
            loanAmount: getBigNumber(1000),
            firstRoutes: [
              {
                hops: [
                  {
                    swaps: [
                      {
                        // sushiswap
                        protocol: 1,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [uniswapRouter.BSC_SUSHISWAP]
                        ),
                      },
                    ],
                    path: [bscTokens.BUSD, bscTokens.USDC],
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
                        // pancakeswap
                        protocol: 1,
                        part: 10000,
                        data: ethers.utils.defaultAbiCoder.encode(
                          ["address"],
                          [uniswapRouter.BSC_PANCAKESWAP]
                        ),
                      },
                    ],
                    path: [bscTokens.USDC, bscTokens.BUSD],
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
      const balance = await BUSD.balanceOf(owner.address);
      expect(balance.gt(getBigNumber(0))).to.be.true;
    });

    // it("USDC - WETH - WBTC", async () => {
    //   await expect(
    //     Flashloan.dodoFlashLoan(
    //       {
    //         flashLoanPool: dodoV2Pool.WETH_USDC,
    //         loanAmount: getBigNumber(1000, 6),
    //         firstRoutes: [
    //           {
    //             hops: [
    //               {
    //                 swaps: [
    //                   {
    //                     protocol: 1,
    //                     part: 10000,
    //                     data: ethers.utils.defaultAbiCoder.encode(
    //                       ["address"],
    //                       [findRouterFromProtocol(1)]
    //                     ),
    //                   },
    //                 ],
    //                 path: [ERC20Token.USDC.address, ERC20Token.WETH.address],
    //               },
    //               {
    //                 swaps: [
    //                   {
    //                     protocol: 2,
    //                     part: 10000,
    //                     data: ethers.utils.defaultAbiCoder.encode(
    //                       ["address"],
    //                       [findRouterFromProtocol(1)]
    //                     ),
    //                   },
    //                 ],
    //                 path: [ERC20Token.WETH.address, ERC20Token.WBTC.address],
    //               },
    //             ],
    //             part: 10000,
    //           },
    //         ],
    //         secondRoutes: [
    //           {
    //             hops: [
    //               {
    //                 swaps: [
    //                   {
    //                     protocol: 3,
    //                     part: 10000,
    //                     data: ethers.utils.defaultAbiCoder.encode(
    //                       ["address"],
    //                       [findRouterFromProtocol(3)]
    //                     ),
    //                   },
    //                 ],
    //                 path: [ERC20Token.WBTC.address, ERC20Token.WETH.address],
    //               },
    //               {
    //                 swaps: [
    //                   {
    //                     protocol: 3,
    //                     part: 10000,
    //                     data: ethers.utils.defaultAbiCoder.encode(
    //                       ["address"],
    //                       [findRouterFromProtocol(3)]
    //                     ),
    //                   },
    //                 ],
    //                 path: [ERC20Token.WETH.address, ERC20Token.USDC.address],
    //               },
    //             ],
    //             part: 10000,
    //           },
    //         ],
    //       },
    //       { gasLimit: 1000000 }
    //     )
    //   )
    //     .emit(Flashloan, "SwapFinished")
    //     .emit(Flashloan, "SentProfit");
    //   const balance = await USDC.balanceOf(owner.address);
    //   expect(balance.gt(getBigNumber(0))).to.be.true;
    // });

    // it("should execute a flashloan with multihop swaps.", async () => {
    //   await expect(
    //     Flashloan.dodoFlashLoan(
    //       {
    //         flashLoanPool: dodoV2Pool.WETH_USDC,
    //         loanAmount: getBigNumber(1000, 6),
    //         firstRoutes: [
    //           {
    //             hops: [
    //               {
    //                 swaps: [
    //                   {
    //                     protocol: 1,
    //                     part: 5000,
    //                     data: ethers.utils.defaultAbiCoder.encode(
    //                       ["address"],
    //                       [findRouterFromProtocol(4)]
    //                     ),
    //                   },
    //                   {
    //                     protocol: 2,
    //                     part: 5000,
    //                     data: ethers.utils.defaultAbiCoder.encode(
    //                       ["address"],
    //                       [findRouterFromProtocol(5)]
    //                     ),
    //                   },
    //                 ],
    //                 path: [bscTokens.USDC, bscTokens.DAI],
    //               },
    //               {
    //                 swaps: [
    //                   {
    //                     protocol: 2,
    //                     part: 9000,
    //                     data: ethers.utils.defaultAbiCoder.encode(
    //                       ["address"],
    //                       [findRouterFromProtocol(1)]
    //                     ),
    //                   },
    //                   {
    //                     protocol: 3,
    //                     part: 1000,
    //                     data: ethers.utils.defaultAbiCoder.encode(
    //                       ["address"],
    //                       [findRouterFromProtocol(2)]
    //                     ),
    //                   },
    //                 ],
    //                 path: [bscTokens.DAI, bscTokens.WETH],
    //               },
    //             ],
    //             part: 10000,
    //           },
    //         ],
    //         secondRoutes: [
    //           {
    //             hops: [
    //               {
    //                 swaps: [
    //                   {
    //                     protocol: 1,
    //                     part: 10000,
    //                     data: ethers.utils.defaultAbiCoder.encode(
    //                       ["address"],
    //                       [findRouterFromProtocol(3)]
    //                     ),
    //                   },
    //                 ],
    //                 path: [bscTokens.WETH, bscTokens.USDC],
    //               },
    //             ],
    //             part: 10000,
    //           },
    //         ],
    //       },
    //       { gasLimit: 1000000 }
    //     )
    //   )
    //     .emit(Flashloan, "SwapFinished")
    //     .emit(Flashloan, "SentProfit");
    //   const balance = await USDC.balanceOf(owner.address);
    //   expect(balance.gt(getBigNumber(0))).to.be.true;
    //   expect(
    //     (await DAI.balanceOf(Flashloan.address)).lt(ethers.BigNumber.from(1000))
    //   ).to.be.true;
    //   expect(
    //     (await WETH.balanceOf(Flashloan.address)).lt(
    //       ethers.BigNumber.from(1000)
    //     )
    //   ).to.be.true;
    // });
  });
});
