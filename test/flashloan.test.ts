import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { WETH_WHALE, dodoV2Pool, erc20Address, uniswapRouter, WMATIC_WHALE, USDC_WHALE } from "../constants/addresses";
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

	before(async () => {
		USDC = await getERC20ContractFromAddress(erc20Address.USDC)
		USDT = await getERC20ContractFromAddress(erc20Address.USDT)
		DAI = await getERC20ContractFromAddress(erc20Address.DAI)
		WETH = await getERC20ContractFromAddress(erc20Address.WETH)
		WMATIC = await getERC20ContractFromAddress(erc20Address.WMATIC)
	})

	beforeEach(async () => {
		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();

		Flashloan = await deployContractFromName(
			"Flashloan",
			Flashloan__factory
		);
		await Flashloan.deployed();
	});

	describe("UniswapV2", () => {

		it("should execute uniswapV2 flashloan.", async () => {
			await impersonateFundErc20(USDC, USDC_WHALE, Flashloan.address, "1.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.WMATIC],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 1,
						fee: []
					}],
					secondRoutes: [{
						path: [erc20Address.WMATIC, erc20Address.USDC],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 1,
						fee: []
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

		it("should execute flashloan with multihop swaps", async () => {
			await impersonateFundErc20(USDC, USDC_WHALE, Flashloan.address, "1.0", 6);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI, erc20Address.WETH],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 1,
						fee: []
					}],
					secondRoutes: [{
						path: [erc20Address.WETH, erc20Address.DAI,erc20Address.USDT, erc20Address.USDC],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 1,
						fee: []
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

	});

	describe("UniswapV3", () => {

		it("should execute flashloan and swap on uniswapV3.", async () => {
			await impersonateFundErc20(USDT, WETH_WHALE, Flashloan.address, "1.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_USDT,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDT, erc20Address.USDC],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 2,
						fee: [500]
					}],
					secondRoutes: [{
						path: [erc20Address.USDC, erc20Address.USDT],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 2,
						fee: [500]
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDT.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

		it("should execute flashloan and swap on uniswapV3 multihop.", async () => {
			await impersonateFundErc20(USDT, WETH_WHALE, Flashloan.address, "1.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_USDT,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDT, erc20Address.USDC],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 2,
						fee: [500]
					}],
					secondRoutes: [{
						path: [erc20Address.USDC, erc20Address.WMATIC, erc20Address.USDT],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 2,
						fee: [3000, 500]
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDT.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

		it("should execute flashloan and swap on uniswapV3 and dodo.", async () => {
			await impersonateFundErc20(USDT, WETH_WHALE, Flashloan.address, "1.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_USDT,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDT, erc20Address.USDC],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 2,
						fee: [500]
					}],
					secondRoutes: [
						{
							path: [erc20Address.USDC, erc20Address.DAI],
							pool: dodoV2Pool.USDC_DAI,
							protocol: 0,
							fee: []
						},
						{
							path: [erc20Address.DAI, erc20Address.USDT],
							pool: uniswapRouter.POLYGON_QUICKSWAP,
							protocol: 1,
							fee: []
						}
					]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDT.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

		it("should execute flashloan and swap on uniswapV3 and uniswapV2.", async () => {
			await impersonateFundErc20(USDT, WETH_WHALE, Flashloan.address, "1.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_USDT,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDT, erc20Address.USDC],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 2,
						fee: [500]
					}],
					secondRoutes: [
						{
							path: [erc20Address.USDC, erc20Address.USDT],
							pool: uniswapRouter.POLYGON_QUICKSWAP,
							protocol: 1,
							fee: []
						}
					]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDT.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

		it("should execute flashloan and swap on uniswapV3 with two hops and uniswapV2.", async () => {
			await impersonateFundErc20(USDT, WETH_WHALE, Flashloan.address, "1.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_USDT,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDT, erc20Address.USDC, erc20Address.DAI],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 2,
						fee: [500, 500]
					}],
					secondRoutes: [
						{
							path: [erc20Address.DAI, erc20Address.USDT],
							pool: uniswapRouter.POLYGON_QUICKSWAP,
							protocol: 1,
							fee: []
						}
					]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDT.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

		it("should execute flashloan and swap on uniswapV2 and uniswapV3 with two hops.", async () => {
			await impersonateFundErc20(USDT, WETH_WHALE, Flashloan.address, "1.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_USDT,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDT, erc20Address.DAI],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 1,
						fee: []
					}],
					secondRoutes: [
						{
							path: [erc20Address.DAI, erc20Address.USDC, erc20Address.USDT],
							pool: uniswapRouter.POLYGON_QUICKSWAP,
							protocol: 2,
							fee: [500, 500]
						}
					]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDT.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

		it("should execute flashloan and swap on uniswapV3 with three hops and uniswapV2.", async () => {
			await impersonateFundErc20(USDT, WETH_WHALE, Flashloan.address, "1.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_USDT,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDT, erc20Address.USDC, erc20Address.WMATIC, erc20Address.DAI],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 2,
						fee: [500, 500, 500]
					}],
					secondRoutes: [
						{
							path: [erc20Address.DAI, erc20Address.USDT],
							pool: uniswapRouter.POLYGON_QUICKSWAP,
							protocol: 1,
							fee: []
						}
					]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDT.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

		it("should execute flashloan and swap on uniswapV2 and uniswapV3 with three hops.", async () => {
			await impersonateFundErc20(USDT, WETH_WHALE, Flashloan.address, "1.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_USDT,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDT, erc20Address.DAI],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 1,
						fee: []
					}],
					secondRoutes: [
						{
							path: [erc20Address.DAI, erc20Address.USDC, erc20Address.WMATIC, erc20Address.USDT],
							pool: uniswapRouter.POLYGON_QUICKSWAP,
							protocol: 2,
							fee: [500, 500, 500]
						}
					]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDT.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});


	});

	describe("DODO", () => {

		it("should execute flashloan.", async () => {
			await impersonateFundErc20(USDC, USDC_WHALE, Flashloan.address, "1.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 1,
						fee: []
					}],
					secondRoutes: [{
						path: [erc20Address.DAI, erc20Address.USDC],
						pool: dodoV2Pool.USDC_DAI,
						protocol: 0,
						fee: []
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

		it("should execute flashloan and swap on uniswap forks and dodo.", async () => {
			await impersonateFundErc20(USDT, WETH_WHALE, Flashloan.address, "1.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_USDT,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [
						{
							path: [erc20Address.USDT, erc20Address.DAI],
							pool: uniswapRouter.POLYGON_QUICKSWAP,
							protocol: 1,
							fee: []
						},
						{
							path: [erc20Address.DAI, erc20Address.USDC],
							pool: dodoV2Pool.USDC_DAI,
							protocol: 0,
							fee: []
						}
					],
					secondRoutes: [{
						path: [erc20Address.USDC, erc20Address.USDT],
						pool: uniswapRouter.POLYGON_SUSHISWAP,
						protocol: 1,
						fee: []
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDT.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

		it("should execute flashloan and swap.", async () => {
			await impersonateFundErc20(USDT, WETH_WHALE, Flashloan.address, "1.0", 6)
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_USDT,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDT, erc20Address.USDC],
						pool: uniswapRouter.POLYGON_SUSHISWAP,
						protocol: 1,
						fee: []
					}],
					secondRoutes: [
						{
							path: [erc20Address.USDC, erc20Address.DAI],
							pool: dodoV2Pool.USDC_DAI,
							protocol: 0,
							fee: []
						},
						{
							path: [erc20Address.DAI, erc20Address.USDT],
							pool: uniswapRouter.POLYGON_QUICKSWAP,
							protocol: 1,
							fee: []
						}
					]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDT.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

	});
});
