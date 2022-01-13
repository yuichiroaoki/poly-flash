import { dodoV2Pool, erc20Address, uniswapRouter } from "../constrants/addresses";
import { Flashloan, Flashloan__factory } from "../typechain";
import { getBigNumber, getContractFromAddress, getERC20ContractFromAddress } from "../utils";

async function main() {
	let Flashloan: Flashloan;
	const flashloanContractAddress = "your-deployed-flashloan-contract-address"
	Flashloan = await getContractFromAddress(
		"Flashloan",
		Flashloan__factory,
		flashloanContractAddress
	);

	const tx = await Flashloan.dodoFlashLoan({
		flashLoanPool: dodoV2Pool.WETH_USDC,
		loanAmount: getBigNumber(1, 6),
		firstRoutes: [{
			path: [erc20Address.USDC, erc20Address.DAI],
			router: uniswapRouter.POLYGON_QUICKSWAP,
		}],
		secondRoutes: [{
			path: [erc20Address.DAI, erc20Address.USDC],
			router: uniswapRouter.POLYGON_QUICKSWAP,
		}]
	}, { gasLimit: 1000000 })
	console.log(tx)

}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

