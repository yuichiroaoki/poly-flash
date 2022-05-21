import { ERC20Map, PoolMap, RouterMap } from "./addresses";

export const BSC_WHALE = "0x5c9F6cA2e81EaEad3D9aFf26efca7Fa307403297";

export const bscTokens: ERC20Map = {
  DAI: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
};

export const uniswapRouter: RouterMap = {
  BSC_PANCAKESWAP: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
};

export const dodoV2Pool: PoolMap = {
  ETH_BUSD: "0x9BA8966B706c905E594AcbB946Ad5e29509f45EB",
};
