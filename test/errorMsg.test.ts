import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BurnAddress, DAI_WHALE, dodoV2Pool, erc20Address, uniswapRouter, WMATIC_WHALE } from "../constrants/addresses";
import { ERC20Mock, Flashloan, Flashloan__factory } from "../typechain";
import { deployContractFromName, getBigNumber, getERC20ContractFromAddress } from "../utils";
import { impersonateFundErc20 } from "../utils/token";

describe("Flashloan Error Message", () => {
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
		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();

		Flashloan = await deployContractFromName(
			"Flashloan",
			Flashloan__factory
		);
		await Flashloan.deployed();

		USDC = await getERC20ContractFromAddress(erc20Address.USDC)
		USDT = await getERC20ContractFromAddress(erc20Address.USDT)
		DAI = await getERC20ContractFromAddress(erc20Address.DAI)
		WETH = await getERC20ContractFromAddress(erc20Address.WETH)
		WMATIC = await getERC20ContractFromAddress(erc20Address.WMATIC)
	});

	describe("Error", () => {

		it("shouldn't be reverted with `INSUFFICIENT_INPUT_AMOUNT` when the bot set a wrong dodo pool and the contract can't borrow tokens.", async () => {
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


		it("should be reverted because of the low gas limit.", async () => {
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
				}, { gasLimit: 50000 })
			).to.be.reverted;
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
						path: [erc20Address.WETH, erc20Address.DAI,erc20Address.USDT, erc20Address.USDC],
						router: uniswapRouter.quickswap,
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(80, 6))).to.be.true;
		});

		it("should be reverted without any error messages when the path includes the burn address.", async () => {
			await impersonateFundErc20(USDC, DAI_WHALE, Flashloan.address, "100.0", 6);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, BurnAddress, erc20Address.WETH],
						router: uniswapRouter.quickswap,
					}],
					secondRoutes: [{
						path: [erc20Address.WETH, erc20Address.USDC],
						router: uniswapRouter.quickswap,
					}]
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("");
		});

		it("should not revert flashloan with wmatic.", async () => {
			await impersonateFundErc20(USDC, DAI_WHALE, Flashloan.address, "100.0", 6);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.WMATIC, erc20Address.WETH],
						router: uniswapRouter.quickswap,
					}],
					secondRoutes: [{
						path: [erc20Address.WETH, erc20Address.USDC],
						router: uniswapRouter.quickswap,
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(80, 6))).to.be.true;
		});
	});
});
