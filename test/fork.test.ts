import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { WETH_WHALE, dodoV2Pool, erc20Address, uniswapRouter, WMATIC_WHALE, USDC_WHALE } from "../constrants/addresses";
import { ERC20Mock, Flashloan, Flashloan__factory } from "../typechain";
import { deployContractFromName, getBigNumber, getERC20ContractFromAddress } from "../utils";
import { impersonateFundErc20 } from "../utils/token";

describe("Flashloan", () => {
	let Flashloan: Flashloan;
	let owner: SignerWithAddress;
	let addr1: SignerWithAddress;
	let addr2: SignerWithAddress;
	let addrs: SignerWithAddress[];
	let DAI: ERC20Mock;
	let USDC: ERC20Mock;
	let WMATIC: ERC20Mock;
	let WETH: ERC20Mock;
	let USDT: ERC20Mock;

	beforeEach(async () => {
		USDC = await getERC20ContractFromAddress(erc20Address.USDC)
		USDT = await getERC20ContractFromAddress(erc20Address.USDT)
		DAI = await getERC20ContractFromAddress(erc20Address.DAI)
		WETH = await getERC20ContractFromAddress(erc20Address.WETH)
		WMATIC = await getERC20ContractFromAddress(erc20Address.WMATIC)
	})

	beforeEach(async () => {
		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();

		const factory = (await ethers.getContractFactory("Flashloan")) as Flashloan__factory
		Flashloan = factory.attach("0xb6C4448386c4ECF4e5eAB057351f8a6A8A465a0D")
		// Flashloan = await deployContractFromName(
		// 	"Flashloan",
		// 	Flashloan__factory
		// );
		await Flashloan.deployed();

	});

	describe("UniswapV3", () => {

		it("should execute flashloan and swap on uniswapV2 and uniswapV3 with three hops.", async () => {
			await impersonateFundErc20(USDC, USDC_WHALE, Flashloan.address, "100.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(100, 6),
					firstRoutes: [
						{
							path: [erc20Address.USDC, erc20Address.WETH],
							pool: uniswapRouter.POLYGON_SUSHISWAP,
							protocol: 1,
							fee: [0]
						},
						{
							path: [erc20Address.WETH, erc20Address.WMATIC],
							pool: uniswapRouter.POLYGON_SUSHISWAP,
							protocol: 2,
							fee: [500]
						},
					],
					secondRoutes: [
						{
							path: [erc20Address.WMATIC, erc20Address.USDC],
							pool: uniswapRouter.POLYGON_SUSHISWAP,
							protocol: 2,
							fee: [500]
						},
					]
				}, { gasLimit: 1500000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			console.log(ethers.utils.formatUnits(balance, 6));
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

		it("should execute 1000.", async () => {
			await impersonateFundErc20(USDC, USDC_WHALE, Flashloan.address, "100.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1000, 6),
					firstRoutes: [
						{
							path: [erc20Address.USDC, erc20Address.WETH],
							pool: uniswapRouter.POLYGON_SUSHISWAP,
							protocol: 1,
							fee: [0]
						},
						{
							path: [erc20Address.WETH, erc20Address.WMATIC],
							pool: uniswapRouter.POLYGON_SUSHISWAP,
							protocol: 2,
							fee: [500]
						},
					],
					secondRoutes: [
						{
							path: [erc20Address.WMATIC, erc20Address.USDC],
							pool: uniswapRouter.POLYGON_SUSHISWAP,
							protocol: 2,
							fee: [500]
						},
					]
				}, { gasLimit: 1500000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			console.log(ethers.utils.formatUnits(balance, 6));
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});


	});

});
