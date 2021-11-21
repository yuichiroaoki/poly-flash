import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { DAI_WHALE, dodoV2Pool, erc20Address, uniswapRouter } from "../constrants/addresses";
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

	beforeEach(async () => {
		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();

		Flashloan = await deployContractFromName(
			"Flashloan",
			Flashloan__factory
		);
		await Flashloan.deployed();

		USDC = await getERC20ContractFromAddress(erc20Address.USDC)
		DAI = await getERC20ContractFromAddress(erc20Address.DAI)
		WMATIC = await getERC20ContractFromAddress(erc20Address.WMATIC)
	});

	describe("flashloan", () => {
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
				})
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
				})
			)
				.emit(Flashloan, "SwapFinished")
				.emit(Flashloan, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(80, 6))).to.be.true;
		});

		it("should execute flashloan like Flashloan with gas limit", async () => {
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
			).to.be.revertedWith("Not enough amount to return loan");
		});

		it("should execute flashloan with initial token amount", async () => {
			await impersonateFundErc20(USDC, DAI_WHALE, Flashloan.address, "100.0", 6);
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
