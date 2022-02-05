export interface IToken {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI: string;
}

type erc20Token = { [erc20: string]: IToken };

export const ERC20Token: erc20Token = {
  MATIC: {
    symbol: "MATIC",
    name: "MATIC",
    decimals: 18,
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    logoURI:
      "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    logoURI:
      "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    logoURI:
      "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
  },
  DAI: {
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    logoURI:
      "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
  },
  WBTC: {
    symbol: "WBTC",
    name: "Wrapped BTC",
    decimals: 8,
    address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
    logoURI:
      "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
  },
  LINK: {
    symbol: "LINK",
    name: "ChainLink Token",
    decimals: 18,
    address: "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
    logoURI:
      "https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png",
  },
  WMATIC: {
    symbol: "WMATIC",
    name: "Wrapped Matic",
    decimals: 18,
    address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    logoURI:
      "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",
  },
  COMP: {
    symbol: "COMP",
    name: "Compound",
    decimals: 18,
    address: "0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c",
    logoURI:
      "https://tokens.1inch.io/0xc00e94cb662c3520282e6f5717214004a7f26888.png",
  },
  CEL: {
    symbol: "CEL",
    name: "Celsius",
    decimals: 4,
    address: "0xd85d1e945766fea5eda9103f918bd915fbca63e6",
    logoURI:
      "https://tokens.1inch.io/0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d.png",
  },
  WETH: {
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    logoURI:
      "https://tokens.1inch.io/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619.png",
  },
  CRV: {
    symbol: "CRV",
    name: "CRV",
    decimals: 18,
    address: "0x172370d5cd63279efa6d502dab29171933a610af",
    logoURI:
      "https://tokens.1inch.io/0xd533a949740bb3306d119cc777fa900ba034cd52.png",
  },
  QI: {
    symbol: "QI",
    name: "Qi Dao",
    decimals: 18,
    address: "0x580a84c73811e1839f75d86d75d88cca0c241ff4",
    logoURI:
      "https://tokens.1inch.io/0x580a84c73811e1839f75d86d75d88cca0c241ff4.png",
  },
  UNI: {
    symbol: "UNI",
    name: "Uniswap",
    decimals: 18,
    address: "0xb33eaad8d922b1083446dc23f610c2567fb5180f",
    logoURI:
      "https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png",
  },
  AAVE: {
    symbol: "AAVE",
    name: "Aave",
    decimals: 18,
    address: "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
    logoURI:
      "https://tokens.1inch.io/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.png",
  },
  MUST: {
    symbol: "MUST",
    name: "Must",
    decimals: 18,
    address: "0x9c78ee466d6cb57a4d01fd887d2b5dfb2d46288f",
    logoURI:
      "https://tokens.1inch.io/0x9c78ee466d6cb57a4d01fd887d2b5dfb2d46288f.png",
  },
  MEME: {
    symbol: "MEME",
    name: "MEME (PoS)",
    decimals: 8,
    address: "0xf2b5a8c37278bcdd50727d5ca879f8e5a4642e2e",
    logoURI:
      "https://tokens.1inch.io/0xd5525d397898e5502075ea5e830d8914f6f0affe.png",
  },
  SUPER: {
    symbol: "SUPER",
    name: "SuperFarm",
    decimals: 18,
    address: "0xa1428174f516f527fafdd146b883bb4428682737",
    logoURI:
      "https://tokens.1inch.io/0xe53ec727dbdeb9e2d5456c3be40cff031ab40a55.png",
  },
  MANA: {
    symbol: "MANA",
    name: "Decentraland MANA",
    decimals: 18,
    address: "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4",
    logoURI:
      "https://tokens.1inch.io/0x0f5d2fb29fb7d3cfee444a200298f468908cc942.png",
  },
  YFI: {
    symbol: "YFI",
    name: "yearn.finance",
    decimals: 18,
    address: "0xda537104d6a5edd53c6fbba9a898708e465260b6",
    logoURI:
      "https://tokens.1inch.io/0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e.png",
  },
  QUICK: {
    symbol: "QUICK",
    name: "Quickswap",
    decimals: 18,
    address: "0x831753dd7087cac61ab5644b308642cc1c33dc13",
    logoURI:
      "https://tokens.1inch.io/0x6c28aef8977c9b773996d0e8376d2ee379446f2f.png",
  },
};
