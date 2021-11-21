import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "@openzeppelin/hardhat-upgrades";
import "solidity-coverage";

import "./tasks/accounts";
import "./tasks/balance";
import "./tasks/block-number";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const configForTest = {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
      {
        version: "0.6.12",
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_POLYGON_RPC_URL,
        blockNumber: 20548800
      }
    },
  },
  mocha: {
    timeout: 200000
  }
} 

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const configLocal = {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
      {
        version: "0.6.12",
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_POLYGON_RPC_URL,
        blockNumber: 21212252
      }
    },
    polygon: {
      url: process.env.ALCHEMY_POLYGON_RPC_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 200000
  }
}

module.exports = process.env.PRIVATE_KEY ? configLocal : configForTest;
