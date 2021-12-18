import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
	ERC20Mock,
	UniswapFork, UniswapFork__factory,
} from "../typechain";
import { 
	DAI_WHALE, erc20Address, uniswapRouter 
} from "../constrants/addresses"
import { impersonateFundErc20 } from "../utils/token"
import { getBigNumber, getERC20ContractFromAddress } from "../utils"

describe("Swap on uniswap fork on polygon", () => {
	let uniswapFork: UniswapFork;
	let owner: SignerWithAddress;
	let addr1: SignerWithAddress;
	let addr2: SignerWithAddress;
	let addrs: SignerWithAddress[];
	let DAI: ERC20Mock;
	let USDC: ERC20Mock;
	let USDT: ERC20Mock;
	let WETH: ERC20Mock;
	let WMATIC: ERC20Mock;

	let fixture: any;

	before(async () => {
		fixture = async () => {
			[owner, addr2, addr2, ...addrs] = await ethers.getSigners();

			const factory = (await ethers.getContractFactory(
				"UniswapFork",
				owner
			)) as UniswapFork__factory;
			uniswapFork = await factory.deploy();

			DAI = await getERC20ContractFromAddress(erc20Address.DAI)
			USDC = await getERC20ContractFromAddress(erc20Address.USDC)
			USDT = await getERC20ContractFromAddress(erc20Address.USDT)
			WETH = await getERC20ContractFromAddress(erc20Address.WETH)
			WMATIC = await getERC20ContractFromAddress(erc20Address.WMATIC)
		};
	});

	beforeEach(async () => {
		await fixture();
	});

	describe("quickswap", async () => {

		it("should be reverted when you don't have a base token.", async () => {
			await expect(
				uniswapFork.uniswapFork(
					uniswapRouter.quickswap,
					erc20Address.DAI,
					getBigNumber(1),
					1,
					[erc20Address.DAI, erc20Address.USDC],
					uniswapFork.address
				)
			).to.be.revertedWith("TransferHelper: TRANSFER_FROM_FAILED");
		});

		it("should be reverted with `INSUFFICIENT_INPUT_AMOUNT`.", async () => {

			await impersonateFundErc20(USDC, DAI_WHALE, uniswapFork.address, "100.0", 6);
			await expect(
				uniswapFork.uniswapFork(
					uniswapRouter.quickswap,
					erc20Address.USDC,
					getBigNumber(1, 6),
					getBigNumber(1),
					[erc20Address.USDC, erc20Address.DAI],
					uniswapFork.address
				)
			).to.be.revertedWith("UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT");
		});

	});

});
