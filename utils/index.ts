import { ethers } from "hardhat";
import { ERC20Mock__factory } from "../typechain";
const { BigNumber } = ethers;

const BASE_TEN = 10;

// Defaults to e18 using amount * 10^18
export const getBigNumber = (amount: number, decimals = 18) => {
  return BigNumber.from(amount).mul(BigNumber.from(BASE_TEN).pow(decimals));
};

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";


export const deployContractFromName = async (
  contractName: string,
  factoryType: any,
  ...args: Array<any>
) => {
  const factory = (await ethers.getContractFactory(contractName)) as typeof factoryType
  return factory.deploy(...args)
}

export const getContractFromAddress = async (
  contractName: string,
  factoryType: any,
  address: string
) => {
  const factory = (await ethers.getContractFactory(contractName)) as typeof factoryType
  return factory.attach(address)
}

export const getERC20ContractFromAddress = async (
  address: string,
) => {
  const factory = (await ethers.getContractFactory("ERC20Mock")) as ERC20Mock__factory
  return factory.attach(address)
}