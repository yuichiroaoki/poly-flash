import { ethers, upgrades } from "hardhat";
import { uniswapRouter, UniswapV3poolFee } from "../constants/addresses";
import { Router, Router__factory } from "../typechain";

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

  console.log("contract deployed to:", Router.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
