import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { dodoV2Pool, USDC_WHALE } from "../../../constants/addresses";
import { ERC20Token } from "../../../constants/token";
import { ERC20Mock, Flashloan, Flashloan__factory } from "../../../typechain";
import {
  deployContractFromName,
  findRouterFromProtocol,
  getBigNumber,
  getERC20ContractFromAddress,
} from "../../../utils";
import { impersonateFundErc20 } from "../../../utils/token";

describe("Uniswap Flashloan", () => {
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
      ).to.not.reverted;
      const balance = await USDC.balanceOf(owner.address);
      expect(balance.gt(getBigNumber(0))).to.be.true;
    });
  });

  describe("UniswapV3", () => {
    it("should execute uniswapV3 flashloan.", async () => {
      await expect(
        Flashloan.dodoFlashLoan(
          {
            flashLoanPool: dodoV2Pool.WETH_USDC,
            loanAmount: getBigNumber(1000, 6),
            routes: [
              {
                hops: [
                  {
                    protocol: 0,
                    data: ethers.utils.defaultAbiCoder.encode(
                      ["address", "uint24"],
                      [findRouterFromProtocol(0), 500]
                    ),
                    path: [ERC20Token.USDC.address, ERC20Token.DAI.address],
                  },
                  {
                    protocol: 0,
                    data: ethers.utils.defaultAbiCoder.encode(
                      ["address", "uint24"],
                      [findRouterFromProtocol(0), 500]
                    ),
                    path: [ERC20Token.DAI.address, ERC20Token.USDC.address],
                  },
                ],
                part: 10000,
              },
            ],
          },
          { gasLimit: 1000000 }
        )
      ).to.not.reverted;
      const balance = await USDC.balanceOf(owner.address);
      expect(balance.gt(getBigNumber(0))).to.be.true;
    });

    it("USDC - WETH - UNI", async () => {
      await expect(
        Flashloan.dodoFlashLoan(
          {
            flashLoanPool: dodoV2Pool.WETH_USDC,
            loanAmount: getBigNumber(1000, 6),
            routes: [
              {
                hops: [
                  {
                    protocol: 0,
                    data: ethers.utils.defaultAbiCoder.encode(
                      ["address", "uint24"],
                      [findRouterFromProtocol(0), 500]
                    ),
                    path: [ERC20Token.USDC.address, ERC20Token.WETH.address],
                  },
                  {
                    protocol: 0,
                    data: ethers.utils.defaultAbiCoder.encode(
                      ["address", "uint24"],
                      [findRouterFromProtocol(0), 3000]
                    ),
                    path: [ERC20Token.WETH.address, ERC20Token.UNI.address],
                  },
                  {
                    protocol: 0,
                    data: ethers.utils.defaultAbiCoder.encode(
                      ["address", "uint24"],
                      [findRouterFromProtocol(0), 3000]
                    ),
                    path: [ERC20Token.UNI.address, ERC20Token.WETH.address],
                  },
                  {
                    protocol: 0,
                    data: ethers.utils.defaultAbiCoder.encode(
                      ["address", "uint24"],
                      [findRouterFromProtocol(0), 500]
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
      )
        .emit(Flashloan, "SwapFinished")
        .emit(Flashloan, "SentProfit");
      const balance = await USDC.balanceOf(owner.address);
      expect(balance.gt(getBigNumber(0))).to.be.true;
    });
  });
});
