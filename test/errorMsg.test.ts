import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { dodoV2Pool, erc20Address, uniswapRouter, BurnAddress, USDC_WHALE } from "../constrants/addresses";
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
	const loanAmount = ethers.BigNumber.from(1000);

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

		it("should revert flashloan when the flashloan pool address is wrong.", async () => {
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WMATIC_WETH,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.WMATIC],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 1,
						fee: []
					}],
					secondRoutes: [{
						path: [erc20Address.WMATIC, erc20Address.USDC],
						pool: dodoV2Pool.WMATIC_USDC,
						protocol: 0,
						fee: []
					}],
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("Wrong flashloan pool address");
		});

		it("should revert flashloan when you borrow and swap tokens from the same pool.", async () => {
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WMATIC_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.WMATIC],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 1,
						fee: []
					}],
					secondRoutes: [{
						path: [erc20Address.WMATIC, erc20Address.USDC],
						pool: dodoV2Pool.WMATIC_USDC,
						protocol: 0,
						fee: []
					}],
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("REENTRANT");
		});

		it("should revert flashloan when the dodo pool address is wrong.", async () => {
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.USDT_DAI,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDT, erc20Address.WETH],
						pool: dodoV2Pool.WMATIC_WETH,
						protocol: 0,
						fee: []
					}],
					secondRoutes: [{
						path: [erc20Address.WETH, erc20Address.DAI],
						pool: uniswapRouter.POLYGON_SUSHISWAP,
						protocol: 1,
						fee: []
					}]
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("Wrong dodo V2 pool address");
		});

		it("should revert flashloan when it cannot pay back the loan.", async () => {
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
						pool: dodoV2Pool.WMATIC_USDC,
						protocol: 0,
						fee: []
					}],
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("Not enough amount to return loan");
		});

		it("should be reverted when you input a wrong protocol number.", async () => {
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: loanAmount,
					firstRoutes: [{
						path: [erc20Address.WETH, erc20Address.WMATIC],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 3,
						fee: []
					}],
					secondRoutes: [{
						path: [erc20Address.WMATIC, erc20Address.WETH],
						pool: dodoV2Pool.WMATIC_USDC,
						protocol: 0,
						fee: []
					}]
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("Wrong protocol");
		});

		it("should be reverted without any error messages when the path includes the burn address.", async () => {
			await impersonateFundErc20(USDC, USDC_WHALE, Flashloan.address, "100.0", 6);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, BurnAddress, erc20Address.WETH],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 1,
						fee: [], 
					}],
					secondRoutes: [{
						path: [erc20Address.WETH, erc20Address.USDC],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 1,
						fee: [], 
					}]
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("");
		});

		it("should not revert flashloan with wmatic.", async () => {
			await impersonateFundErc20(USDC, USDC_WHALE, Flashloan.address, "100.0", 6);
			await expect(
				Flashloan.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.WMATIC, erc20Address.WETH],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 1,
						fee: [],
					}],
					secondRoutes: [{
						path: [erc20Address.WETH, erc20Address.USDC],
						pool: uniswapRouter.POLYGON_QUICKSWAP,
						protocol: 1,
						fee: [],
					}]
				}, { gasLimit: 1000000 })
			)
				.emit(Flashloan, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(80, 6))).to.be.true;
		});
	});
});
