import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { DAI_WHALE, dodoV2Pool, erc20Address, quickRouter } from "../constrants/addresses";
import { ERC20Mock, ProdV2, ProdV2__factory } from "../typechain";
import { deployContractFromName, getBigNumber, getERC20ContractFromAddress } from "../utils";
import { impersonateFundErc20 } from "../utils/token";

describe("ProdV2", () => {
	let Production: ProdV2;
	let owner: SignerWithAddress;
	let addr1: SignerWithAddress;
	let addr2: SignerWithAddress;
	let addrs: SignerWithAddress[];
	let DAI: ERC20Mock;
	let USDC: ERC20Mock;
	let WMATIC: ERC20Mock;

	beforeEach(async () => {
		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();

		Production = await deployContractFromName(
			"ProdV2",
			ProdV2__factory
		);
		await Production.deployed();

		USDC = await getERC20ContractFromAddress(erc20Address.USDC)
		DAI = await getERC20ContractFromAddress(erc20Address.DAI)
		WMATIC = await getERC20ContractFromAddress(erc20Address.WMATIC)
	});

	describe("flashloan", () => {
		it("should revert flashloan when there's no arbitrage opportunity.", async () => {
			await expect(
				Production.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI],
						router: quickRouter,
					}],
					secondRoutes: [{
						path: [erc20Address.DAI, erc20Address.USDC],
						router: quickRouter,
					}]
				})
			).to.be.revertedWith("Not enough amount to return loan");
		});

		it("should execute flashloan.", async () => {
			await impersonateFundErc20(USDC, DAI_WHALE, Production.address, "100.0", 6);
			await expect(
				Production.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI],
						router: quickRouter,
					}],
					secondRoutes: [{
						path: [erc20Address.DAI, erc20Address.USDC],
						router: quickRouter,
					}]
				})
			)
			.emit(Production, "SwapFinished")
			.emit(Production, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(80, 6))).to.be.true;
		});

		it("should execute flashloan like production with gas limit", async () => {
			await expect(
				Production.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI],
						router: quickRouter,
					}],
					secondRoutes: [{
						path: [erc20Address.DAI, erc20Address.USDC],
						router: quickRouter,
					}]
				}, { gasLimit: 1000000 })
			).to.be.revertedWith("Not enough amount to return loan");
		});

		it("should execute flashloan with initial token amount", async () => {
			await impersonateFundErc20(USDC, DAI_WHALE, Production.address, "100.0", 6);
			await expect(
				Production.dodoFlashLoan({
					flashLoanPool: dodoV2Pool.WETH_USDC,
					loanAmount: getBigNumber(1, 6),
					firstRoutes: [{
						path: [erc20Address.USDC, erc20Address.DAI],
						router: quickRouter,
					}],
					secondRoutes: [{
						path: [erc20Address.DAI, erc20Address.USDC],
						router: quickRouter,
					}]
				}, { gasLimit: 1000000 })
			)
			.emit(Production, "SentProfit");
			const balance = await USDC.balanceOf(owner.address);
			expect(balance.gt(getBigNumber(80, 6))).to.be.true;
		});
	});
});
