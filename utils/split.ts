import { BigNumber } from "ethers";

const routeParts = [
  [10000],
  [8000, 2000],
  [5000, 4000, 1000],
  [5000, 3000, 1000, 1000],
  [3000, 2000, 2000, 2000, 1000],
  [2000, 2000, 2000, 2000, 1000, 1000],
];

export const getRouteParts = (length: number) => {
  try {
    return routeParts[length - 1];
  } catch {
    throw new Error(`Route length ${length} is not supported`);
  }
};

export const toInt = (float: number) => {
  return float * 100;
};

export const splitLoanAmount = (
  loanAmount: BigNumber,
  part: number
): BigNumber => {
  return loanAmount.mul(part).div(10000);
};
