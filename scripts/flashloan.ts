import { ethers } from "hardhat";
import { dodoV2Pool, erc20Address } from "../constants/addresses";
import { Flashloan__factory } from "../typechain";
import {
  findRouterFromProtocol,
  getBigNumber,
  getContractFromAddress,
  getERC20ContractFromAddress,
} from "../utils";
import { getErc20Balance } from "../utils/token";

/**
 * @dev This is an example that shows how to execute a flash loan with your deployed contract.
 * Usage
 * 1. Input your deployed contract address in the script
 * 2. Edit each parameter to your needs (For more information, see "https://github.com/yuichiroaoki/poly-flash/wiki/Supporting-Dex-Protocols")
 * 3. Run the script with `npx hardhat run scripts/flashloan.ts`
 */
async function main() {
  const Flashloan = await getContractFromAddress(
    "Flashloan",
    Flashloan__factory,
    "your-deployed-contract-address-here"
  );
  const [owner] = await ethers.getSigners();
  const USDC = await getERC20ContractFromAddress(erc20Address.USDC);
  const tx = await Flashloan.dodoFlashLoan(
    {
      flashLoanPool: dodoV2Pool.WETH_USDC,
      loanAmount: getBigNumber(1000, 6),
      routes: [
        {
          hops: [
            {
              // protocol number
              protocol: 1,
              // byte data used for swapping
              data: ethers.utils.defaultAbiCoder.encode(
                ["address"],
                [findRouterFromProtocol(1)]
              ),
              path: [erc20Address.USDC, erc20Address.WETH],
            },
            {
              // UniswapV3
              protocol: 0,
              data: ethers.utils.defaultAbiCoder.encode(
                ["address", "uint24"],
                // 0.05 % => 500 (Input USDC/WETH pool fee)
                [findRouterFromProtocol(0), 500]
              ),
              path: [erc20Address.WETH, erc20Address.USDC],
            },
          ],
          part: 10000,
        },
      ],
    },
    {
      gasLimit: 3_000_000,
      // refer to https://polygonscan.com/gastracker
      gasPrice: ethers.utils.parseUnits("300", "gwei"),
    }
  );
  console.log(tx.hash);
  await getErc20Balance(USDC, owner.address, "balance", 6);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
