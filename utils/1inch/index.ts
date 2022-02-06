import { ethers } from "hardhat";
import { ERC20Token, IToken } from "../../constants/token";
import { uniswapRouter } from "../../constants/addresses";
import { Hop, IFlashloanRoute, IProtocol, Swap } from "./interfaces";
import { sendRequest } from "../../utils/request";
import { get1inchQuoteCallUrl } from "./url";
import { getRouteParts, toInt } from "../split";
import { chainId } from "./config";
import { findRouterFromProtocol } from "..";

export async function oneinchRoutes(
  fromToken: IToken,
  toToken: IToken,
  loanAmount: number
): Promise<[IFlashloanRoute[] | null, IFlashloanRoute[] | null]> {
  const fromTokenDecimal = fromToken.decimals;

  const amount = ethers.utils.parseUnits(
    loanAmount.toString(),
    fromTokenDecimal
  );
  const firstCallURL = get1inchQuoteCallUrl(
    chainId,
    fromToken.address,
    toToken.address,
    amount
  );

  const resultData1 = await sendRequest(firstCallURL);
  if (!!resultData1.isAxiosError) {
    const e = resultData1;
    return [null, null];
  }

  const firstProtocols = resultData1.protocols;
  const returnAmount = resultData1.toTokenAmount;
  const secondCallURL = get1inchQuoteCallUrl(
    chainId,
    toToken.address,
    fromToken.address,
    returnAmount
  );

  const resultData2 = await sendRequest(secondCallURL);
  if (!!resultData2.isAxiosError) {
    const e = resultData2;
    return [null, null];
  }
  const secondProtocols = resultData2.protocols;
  return [createRoutes(firstProtocols), createRoutes(secondProtocols)];
}

export const createRoutes = (routes: IProtocol[][][]): IFlashloanRoute[] => {
  let flashloanRoutes: IFlashloanRoute[] = [];
  let i = 0;
  const routeParts = getRouteParts(routes.length);
  for (const hops of routes) {
    const part = routeParts[i];
    let route: IFlashloanRoute = {
      part: part,
      hops: toHops(hops),
    };
    flashloanRoutes.push(route);
    i++;
  }
  return flashloanRoutes;
};

const createData = (protocol: number) => {
  if (protocol === 0) {
    return ethers.utils.defaultAbiCoder.encode(
      ["address", "uint24"],
      [findRouterFromProtocol(protocol), 500]
    );
  } else {
    return ethers.utils.defaultAbiCoder.encode(
      ["address"],
      [findRouterFromProtocol(protocol)]
    );
  }
};

const toSwaps = (results: IProtocol[]) => {
  let swaps: Swap[] = [];
  for (const result of results) {
    const protocol = protocolNameToNumber(result.name);
    const data = createData(protocol);
    swaps.push({
      protocol: protocol,
      part: toInt(result.part),
      data: data,
    });
  }
  return swaps;
};

const toHops = (results: IProtocol[][]) => {
  let hops: Hop[] = [];
  for (const result of results) {
    const path = [result[0].fromTokenAddress, result[0].toTokenAddress].map(
      (token) => {
        return replaceTokenAddress(
          token,
          ERC20Token.MATIC.address,
          ERC20Token.WMATIC.address
        );
      }
    );
    let hop: Hop = {
      path: path,
      swaps: toSwaps(result),
    };
    hops.push(hop);
  }
  return hops;
};

const protocolNameToNumber = (protocolName: string): number => {
  let protocolNumber = 0;
  for (const name of Object.keys(uniswapRouter)) {
    if (name === protocolName) {
      return protocolNumber;
    }
    protocolNumber++;
  }
  throw new Error(`Unknown protocol name: ${protocolName}`);
};

const replaceTokenAddress = (
  token: string,
  address: string,
  newAddress: string
) => {
  return token === address ? newAddress : token;
};
