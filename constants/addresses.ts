export const polyAAVEAddressProvider =
  "0xd05e3E715d945B59290df0ae8eF85c1BdB684744";
export const WETH_WHALE = "0x0298B2eCdef68BC139B098461217a5B3161B69C8";
export const WMATIC_WHALE = "0xFffbCD322cEace527C8ec6Da8de2461C6D9d4e6e";
export const USDC_WHALE = "0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8";
export const dex1inch = "0x11111112542D85B3EF69AE05771c2dCCff4fAa26";
export const BurnAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

type ERC20Map = { [erc20: string]: string };

export const erc20Address: ERC20Map = {
  DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  WETH: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
  USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  WMATIC: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
};

type PoolMap = { [pair: string]: string };

export const dodoV2Pool: PoolMap = {
  USDC_DAI: "0xaaE10Fa31E73287687ce56eC90f81A800361B898",
  USDT_DAI: "0xDa43a4aAB20D313Ab3AA07d8E09f3521F32a3D83",
  WETH_USDC: "0x5333Eb1E32522F1893B7C9feA3c263807A02d561",
  WMATIC_USDC: "0x10Dd6d8A29D489BEDE472CC1b22dc695c144c5c7",
  WMATIC_WETH: "0x80db8525F61e8C3688DBb7fFa9ABcae05Ae8a90A",
  USDC_USDT: "0xA0020444b98f67B77a3d6dE6E66aF11c87da086e",
  WBTC_USDC: "0xe020008465cD72301A18b97d33D73bF44858A4b7",
};

type RouterMap = { [protocol: string]: string };

export const uniswapRouter: RouterMap = {
  POLYGON_UNISWAP_V3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  POLYGON_SUSHISWAP: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
  POLYGON_QUICKSWAP: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
  POLYGON_JETSWAP: "0x5C6EC38fb0e2609672BDf628B1fD605A523E5923",
  POLYGON_POLYCAT: "0x94930a328162957FF1dd48900aF67B5439336cBD",
  POLYGON_APESWAP: "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607",
  POLYGON_WAULTSWAP: "0x3a1D87f206D12415f5b0A33E786967680AAb4f6d",
};

interface PoolInfo {
  base: string;
  quote: string;
  fee: number;
}

export const UniswapV3poolFee: PoolInfo[] = [
  { base: erc20Address.DAI, quote: erc20Address.USDC, fee: 500 },
  { base: erc20Address.DAI, quote: erc20Address.USDT, fee: 500 },
  { base: erc20Address.DAI, quote: erc20Address.WETH, fee: 3000 },
  { base: erc20Address.DAI, quote: erc20Address.WMATIC, fee: 500 },
  { base: erc20Address.USDC, quote: erc20Address.USDT, fee: 500 },
  { base: erc20Address.USDC, quote: erc20Address.WETH, fee: 500 },
  { base: erc20Address.USDC, quote: erc20Address.WMATIC, fee: 500 },
  { base: erc20Address.USDT, quote: erc20Address.WETH, fee: 3000 },
  { base: erc20Address.USDT, quote: erc20Address.WMATIC, fee: 500 },
  { base: erc20Address.WETH, quote: erc20Address.WMATIC, fee: 500 },
];

/**
 * deployed Router contract address
 * https://polygonscan.com/address/0x112aae1218e91392293cb3e63d4f9e7c9c376d2c
 */
export const routerAddress = "0x112Aae1218E91392293cb3E63d4f9E7C9c376d2c";

export const DODOApprove = {
  ETH: "0xCB859eA579b28e02B87A1FDE08d087ab9dbE5149",
  BSC: "0xa128Ba44B2738A558A1fdC06d6303d52D3Cef8c1",
  Polygon: "0x6D310348d5c12009854DFCf72e0DF9027e8cb4f4",
  Heco: "0x68b6c06Ac8Aa359868393724d25D871921E97293",
  Arbitrum: "0xA867241cDC8d3b0C07C85cC06F25a0cD3b5474d8",
};

export const DODOV2Proxy = {
  ETH: "0xa356867fDCEa8e71AEaF87805808803806231FdC",
  BSC: "0x8F8Dd7DB1bDA5eD3da8C9daf3bfa471c12d58486",
  Polygon: "0xa222e6a71D1A1Dd5F279805fbe38d5329C1d0e70",
  Heco: "0xAc7cC7d2374492De2D1ce21e2FEcA26EB0d113e7",
  Arbitrum: "0x88CBf433471A0CD8240D2a12354362988b4593E5",
};

export const CurveSwapsAddress = "0x1d8b86e3D88cDb2d34688e87E72F388Cb541B7C8";
