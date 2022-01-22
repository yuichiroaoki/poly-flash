import { ethers, upgrades } from "hardhat";
import { uniswapRouter, UniswapV3poolFee } from "../constants/addresses";
import {
  Router,
  Flashloan,
  Flashloan__factory,
  Router__factory,
} from "../typechain";
import { deployContractFromName } from "../utils";

async function main() {
  const factory = (await ethers.getContractFactory(
    "Router"
  )) as Router__factory;
  const Router = (await upgrades.deployProxy(
    factory,
    [Object.values(uniswapRouter), UniswapV3poolFee],
    {
      initializer: "initialize",
    }
  )) as Router;
  await Router.deployed();

  const Flashloan: Flashloan = await deployContractFromName(
    "Flashloan",
    Flashloan__factory,
    [Router.address]
  );
  await Flashloan.deployed();

  console.log("contract deployed to:", Flashloan.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
