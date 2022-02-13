import { ethers } from "hardhat";
const { BigNumber } = ethers;

export interface IRoute {
  name: string;
  toTokenAddress: string;
}

export interface Swap {
  protocol: number;
  part: number;
  data: string;
}

export interface Hop {
  swaps: Swap[];
  path: string[];
}

export interface IFlashloanRoute {
  hops: Hop[];
  part: number;
}

export interface IParams {
  flashLoanPool: string;
  loanAmount: typeof BigNumber;
  firstRoutes: IFlashloanRoute[];
  secondRoutes: IFlashloanRoute[];
}

export interface IProtocol {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
}
