import { ethers } from "hardhat";
import { uniswapRouter } from "../constants/addresses";
import { ERC20Mock__factory } from "../typechain";

export const getBigNumber = (amount: number, decimals = 18) => {
  return ethers.utils.parseUnits(amount.toString(), decimals);
};

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const deployContractFromName = async (
  contractName: string,
  factoryType: any,
  args: Array<any> = []
) => {
  const factory = (await ethers.getContractFactory(
    contractName
  )) as typeof factoryType;
  return factory.deploy(...args);
};

export const getContractFromAddress = async (
  contractName: string,
  factoryType: any,
  address: string
) => {
  const factory = (await ethers.getContractFactory(
    contractName
  )) as typeof factoryType;
  return factory.attach(address);
};

export const getERC20ContractFromAddress = async (address: string) => {
  const factory = (await ethers.getContractFactory(
    "ERC20Mock"
  )) as ERC20Mock__factory;
  return factory.attach(address);
};

/**
 * @param protocol
 * @returns router address
 */
export const findRouterFromProtocol = (protocol: number) => {
  return uniswapRouter[Object.keys(uniswapRouter)[protocol]];
};
