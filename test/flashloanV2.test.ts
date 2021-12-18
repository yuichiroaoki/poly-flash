import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { DAI_WHALE, dodoV2Pool, erc20Address, uniswapRouter, WMATIC_WHALE } from "../constrants/addresses";
import { ERC20Mock, FlashloanV2, FlashloanV2__factory } from "../typechain";
import { deployContractFromName, getBigNumber, getERC20ContractFromAddress } from "../utils";
import { impersonateFundErc20 } from "../utils/token";

describe("FlashloanV2", () => {
	let Flashloan: FlashloanV2;
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
		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();

		Flashloan = await deployContractFromName(
			"FlashloanV2",
			FlashloanV2__factory
		);
		await Flashloan.deployed();

		USDC = await getERC20ContractFromAddress(erc20Address.USDC)
		USDT = await getERC20ContractFromAddress(erc20Address.USDT)
		DAI = await getERC20ContractFromAddress(erc20Address.DAI)
		WETH = await getERC20ContractFromAddress(erc20Address.WETH)
		WMATIC = await getERC20ContractFromAddress(erc20Address.WMATIC)
	});

	describe("Borrow from WETH_USDC", () => {

		it("should revert flashloan when the pool address is wrong.", async () => {
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WMATIC_USDT,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI],
						router: uniswapRouter.quickswap,
					}],
					secondRoutes: [{
						path: [erc20Address.DAI, erc20Address.USDC],
						router: uniswapRouter.quickswap
					}],
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("Wrong pool address");
		});

		it("should revert flashloan when there's no arbitrage opportunity.", async () => {
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI],
						router: uniswapRouter.quickswap,
					}],
					secondRoutes: [{
						path: [erc20Address.DAI, erc20Address.USDC],
						router: uniswapRouter.quickswap
					}],
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("Not enough amount to return loan");
		});

		it("should execute flashloan.", async () => {
			await impersonateFundErc20(USDC, DAI_WHALE, Flashloan.address, "100.0", 6);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI],
						router: uniswapRouter.quickswap
					}],
					secondRoutes: [{
						path: [erc20Address.DAI, erc20Address.USDC],
						router: uniswapRouter.quickswap
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(80, 6))).to.be.true;
		});

		it("should borrow WETH and execute flashloan.", async () => {
			await impersonateFundErc20(WETH, DAI_WHALE, Flashloan.address, "1.0", 18);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1),
					firstRoutes: [{
						path: [erc20Address.WETH, erc20Address.DAI],
						router: uniswapRouter.quickswap
					}],
					secondRoutes: [{
						path: [erc20Address.DAI, erc20Address.WETH],
						router: uniswapRouter.quickswap
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await WETH.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(80, 6))).to.be.true;
		});

		it("should execute flashloan with multihop swaps", async () => {
			await impersonateFundErc20(USDC, DAI_WHALE, Flashloan.address, "100.0", 6);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI, erc20Address.WETH],
						router: uniswapRouter.quickswap,
					}],
					secondRoutes: [{
						path: [erc20Address.WETH, erc20Address.DAI, erc20Address.USDC],
						router: uniswapRouter.quickswap,
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(80, 6))).to.be.true;
		});
	});

	describe("Borrow from USDC_DAI", () => {

		it("should revert flashloan when the pool address is wrong.", async () => {
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WMATIC_USDT,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI],
						router: uniswapRouter.quickswap,
					}],
					secondRoutes: [{
						path: [erc20Address.DAI, erc20Address.USDC],
						router: uniswapRouter.quickswap
					}],
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("Wrong pool address");
		});

		it("should revert flashloan when there's no arbitrage opportunity.", async () => {
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_DAI,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI],
						router: uniswapRouter.quickswap,
					}],
					secondRoutes: [{
						path: [erc20Address.DAI, erc20Address.USDC],
						router: uniswapRouter.quickswap
					}],
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("Not enough amount to return loan");
		});

		it("should execute flashloan.", async () => {
			await impersonateFundErc20(USDC, DAI_WHALE, Flashloan.address, "100.0", 6);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_DAI,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI],
						router: uniswapRouter.quickswap
					}],
					secondRoutes: [{
						path: [erc20Address.DAI, erc20Address.USDC],
						router: uniswapRouter.quickswap
					}]
				})
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(80, 6))).to.be.true;
		});

		it("should borrow DAI and execute flashloan.", async () => {
			await impersonateFundErc20(DAI, DAI_WHALE, Flashloan.address, "1.0", 18);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_DAI,
					loanAmount: getBigNumber(1),
					firstRoutes: [{
						path: [erc20Address.DAI, erc20Address.USDC],
						router: uniswapRouter.quickswap
					}],
					secondRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI],
						router: uniswapRouter.quickswap
					}]
				})
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await DAI.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

		it("should execute flashloan with multihop swaps", async () => {
			await impersonateFundErc20(USDC, DAI_WHALE, Flashloan.address, "100.0", 6);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDC_DAI,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI, erc20Address.WETH],
						router: uniswapRouter.quickswap,
					}],
					secondRoutes: [{
						path: [erc20Address.WETH, erc20Address.DAI, erc20Address.USDC],
						router: uniswapRouter.quickswap,
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(80, 6))).to.be.true;
		});
	});

	describe("Borrow from WMATIC_USDT", () => {

		it("should revert flashloan when the pool address is wrong.", async () => {
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDT_DAI,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.WMATIC, erc20Address.USDT],
						router: uniswapRouter.quickswap,
					}],
					secondRoutes: [{
						path: [erc20Address.USDT, erc20Address.WMATIC],
						router: uniswapRouter.quickswap
					}],
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("Wrong pool address");
		});

		it("should revert flashloan when there's no arbitrage opportunity.", async () => {
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WMATIC_USDT,
					loanAmount: getBigNumber(1),
					firstRoutes: [{
						path: [erc20Address.WMATIC, erc20Address.USDT],
						router: uniswapRouter.quickswap,
					}],
					secondRoutes: [{
						path: [erc20Address.USDT, erc20Address.WMATIC],
						router: uniswapRouter.quickswap
					}],
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("Not enough amount to return loan");
		});

		it("should execute flashloan.", async () => {
			await impersonateFundErc20(WMATIC, WMATIC_WHALE, Flashloan.address, "1.0", 18);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WMATIC_USDT,
					loanAmount: getBigNumber(1),
					firstRoutes: [{
						path: [erc20Address.WMATIC, erc20Address.USDT],
						router: uniswapRouter.quickswap
					}],
					secondRoutes: [{
						path: [erc20Address.USDT, erc20Address.WMATIC],
						router: uniswapRouter.quickswap
					}]
				})
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await WMATIC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0))).to.be.true;
		});

		it("should borrow USDT and execute flashloan.", async () => {
			await impersonateFundErc20(USDT, WMATIC_WHALE, Flashloan.address, "10.0", 6);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WMATIC_USDT,
					loanAmount: getBigNumber(10, 6),
					firstRoutes: [{
						path: [erc20Address.USDT, erc20Address.WMATIC],
						router: uniswapRouter.quickswap
					}],
					secondRoutes: [{
						path: [erc20Address.WMATIC, erc20Address.USDT],
						router: uniswapRouter.quickswap
					}]
				})
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDT.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(0, 6))).to.be.true;
		});

		it("should execute flashloan with multihop swaps", async () => {
			await impersonateFundErc20(WMATIC, WMATIC_WHALE, Flashloan.address, "100.0", 18);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WMATIC_USDT,
					loanAmount: getBigNumber(100),
					firstRoutes: [{
						path: [erc20Address.WMATIC, erc20Address.USDT, erc20Address.USDC],
						router: uniswapRouter.quickswap,
					}],
					secondRoutes: [{
						path: [erc20Address.USDC, erc20Address.USDT, erc20Address.WMATIC],
						router: uniswapRouter.quickswap,
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SentProfit");
			const balance = await WMATIC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(80))).to.be.true;
		});
	});
});
