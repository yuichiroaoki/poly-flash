import { ethers } from "hardhat";
import { getBigNumber } from "../../utils";

export const getPriceOnUniV2 = async (
  tokenIn: string,
  tokenOut: string,
  amountIn: any,
  routerAddress: string
) => {
  const RouterV2 = await ethers.getContractAt(
    "IUniswapV2Router02",
    routerAddress
  );
  const amountsOut = await RouterV2.getAmountsOut(amountIn, [
    tokenIn,
    tokenOut,
  ]);
  if (!amountsOut || amountsOut.length !== 2) {
    return getBigNumber(0);
  }
  return amountsOut[1];
};
