import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
	ERC20Mock,
	UniswapFork, UniswapFork__factory,
} from "../typechain";
import { 
	USDC_WHALE,
	erc20Address, uniswapRouter, WETH_WHALE 
} from "../constrants/addresses"
import { getErc20Balance, impersonateFundErc20 } from "../utils/token"
import { getBigNumber, getERC20ContractFromAddress } from "../utils"

describe("Swap on uniswap fork on polygon", () => {
	let Sushi: UniswapFork;
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
		USDC = await getERC20ContractFromAddress(erc20Address.USDC)
		USDT = await getERC20ContractFromAddress(erc20Address.USDT)
		DAI = await getERC20ContractFromAddress(erc20Address.DAI)
		WETH = await getERC20ContractFromAddress(erc20Address.WETH)
		WMATIC = await getERC20ContractFromAddress(erc20Address.WMATIC)
	})

	before(async () => {
		fixture = async () => {
			[owner, addr2, addr2, ...addrs] = await ethers.getSigners();

			const factory = (await ethers.getContractFactory(
				"UniswapFork",
				owner
			)) as UniswapFork__factory;
			Sushi = await factory.deploy();
		};
	});

	beforeEach(async () => {
		await fixture();
	});

	describe("quickswap", async () => {
		it("should execute dai -> usdc swap", async () => {
			await impersonateFundErc20(DAI, USDC_WHALE, Sushi.address, "100.0");
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_QUICKSWAP,
					erc20Address.DAI,
					getBigNumber(1),
					1,
					[erc20Address.DAI, erc20Address.USDC],
					Sushi.address
				)
			).to.not.reverted;
		});

		it("should swap multihop usdc -> dai", async () => {
			await impersonateFundErc20(USDC, USDC_WHALE, Sushi.address, "100.0", 6);
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_QUICKSWAP,
					erc20Address.USDC,
					getBigNumber(1, 6),
					1,
					[erc20Address.USDC, erc20Address.DAI],
					Sushi.address
				)
			).to.not.reverted;
		});

		it("should execute dai -> wmatic swap with multihop", async () => {
			await impersonateFundErc20(DAI, USDC_WHALE, Sushi.address, "100.0");
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_QUICKSWAP,
					erc20Address.DAI,
					getBigNumber(100),
					1,
					[erc20Address.DAI, erc20Address.USDT, erc20Address.WMATIC],
					Sushi.address
				)
			).to.not.reverted;
		});
	});

	describe("sushiswap", async () => {
		it("should execute dai -> usdc swap", async () => {
			await impersonateFundErc20(DAI, USDC_WHALE, Sushi.address, "100.0");
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_SUSHISWAP,
					erc20Address.DAI,
					getBigNumber(1),
					1,
					[erc20Address.DAI, erc20Address.USDC],
					Sushi.address
				)
			).to.not.reverted;
		});

		it("should execute usdc -> dai swap", async () => {
			await impersonateFundErc20(USDC, USDC_WHALE, Sushi.address, "100.0", 6);
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_SUSHISWAP,
					erc20Address.USDC,
					getBigNumber(1, 6),
					1,
					[erc20Address.USDC, erc20Address.DAI],
					Sushi.address
				)
			).to.not.reverted;
		});

		it("should execute dai -> wmatic swap with multihop", async () => {
			await impersonateFundErc20(DAI, USDC_WHALE, Sushi.address, "100.0");
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_SUSHISWAP,
					erc20Address.DAI,
					getBigNumber(100),
					1,
					[erc20Address.DAI, erc20Address.USDT, erc20Address.WMATIC],
					Sushi.address
				)
			).to.not.reverted;
		});
	});

	describe("waultswap", async () => {
		it("should execute dai -> usdc swap", async () => {
			await impersonateFundErc20(DAI, USDC_WHALE, Sushi.address, "100.0");
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_WAULTSWAP,
					erc20Address.DAI,
					getBigNumber(1),
					1,
					[erc20Address.DAI, erc20Address.USDC],
					Sushi.address
				)
			).to.not.reverted;
		});

		it("should execute usdc -> dai swap", async () => {
			await impersonateFundErc20(USDC, USDC_WHALE, Sushi.address, "100.0", 6);
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_WAULTSWAP,
					erc20Address.USDC,
					getBigNumber(1, 6),
					1,
					[erc20Address.USDC, erc20Address.DAI],
					Sushi.address
				)
			).to.not.reverted;
		});

		it("should execute dai -> wmatic swap with multihop", async () => {
			await impersonateFundErc20(DAI, USDC_WHALE, Sushi.address, "100.0");
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_WAULTSWAP,
					erc20Address.DAI,
					getBigNumber(100),
					1,
					[erc20Address.DAI, erc20Address.USDT, erc20Address.WMATIC],
					Sushi.address
				)
			).to.not.reverted;
		});
	});

	describe("jetswap", async () => {
		it("should execute dai -> usdc swap", async () => {
			await impersonateFundErc20(DAI, USDC_WHALE, Sushi.address, "100.0");
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_JETSWAP,
					erc20Address.DAI,
					getBigNumber(1),
					1,
					[erc20Address.DAI, erc20Address.USDC],
					Sushi.address
				)
			).to.not.reverted;
		});

		it("should execute usdc -> dai swap", async () => {
			await impersonateFundErc20(USDC, USDC_WHALE, Sushi.address, "100.0", 6);
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_JETSWAP,
					erc20Address.USDC,
					getBigNumber(1, 6),
					1,
					[erc20Address.USDC, erc20Address.DAI],
					Sushi.address
				)
			).to.not.reverted;
		});

		it("should execute dai -> wmatic swap with multihop", async () => {
			await impersonateFundErc20(DAI, USDC_WHALE, Sushi.address, "100.0");
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_JETSWAP,
					erc20Address.DAI,
					getBigNumber(100),
					1,
					[erc20Address.DAI, erc20Address.USDC, erc20Address.WMATIC],
					Sushi.address
				)
			).to.not.reverted;
		});
	});

	describe("apeswap", async () => {
		it("should execute dai -> usdc swap", async () => {
			await impersonateFundErc20(DAI, USDC_WHALE, Sushi.address, "100.0");
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_APESWAP,
					erc20Address.DAI,
					getBigNumber(1),
					1,
					[erc20Address.DAI, erc20Address.USDC],
					Sushi.address
				)
			).to.not.reverted;
		});

		it("should execute usdc -> dai swap", async () => {
			await impersonateFundErc20(USDC, USDC_WHALE, Sushi.address, "100.0", 6);
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_APESWAP,
					erc20Address.USDC,
					getBigNumber(1, 6),
					1,
					[erc20Address.USDC, erc20Address.DAI],
					Sushi.address
				)
			).to.not.reverted;
		});

		it("should execute dai -> wmatic swap with multihop", async () => {
			await impersonateFundErc20(DAI, USDC_WHALE, Sushi.address, "100.0");
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_APESWAP,
					erc20Address.DAI,
					getBigNumber(100),
					1,
					[erc20Address.DAI, erc20Address.USDT, erc20Address.WMATIC],
					Sushi.address
				)
			).to.not.reverted;
		});
	});

	describe("polycat", async () => {
		it("should execute dai -> usdc swap", async () => {
			await impersonateFundErc20(DAI, USDC_WHALE, Sushi.address, "100.0");
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_POLYCAT,
					erc20Address.DAI,
					getBigNumber(1),
					1,
					[erc20Address.DAI, erc20Address.USDC],
					Sushi.address
				)
			).to.not.reverted;
		});

		it("should execute usdc -> dai swap", async () => {
			await impersonateFundErc20(USDC, USDC_WHALE, Sushi.address, "100.0", 6);
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_POLYCAT,
					erc20Address.USDC,
					getBigNumber(1, 6),
					1,
					[erc20Address.USDC, erc20Address.DAI],
					Sushi.address
				)
			).to.not.reverted;
		});

		it("should execute dai -> wmatic swap with multihop", async () => {
			await impersonateFundErc20(DAI, USDC_WHALE, Sushi.address, "100.0");
			await expect(
				Sushi.uniswapFork(
					uniswapRouter.POLYGON_POLYCAT,
					erc20Address.DAI,
					getBigNumber(100),
					1,
					[erc20Address.DAI, erc20Address.USDT, erc20Address.WMATIC],
					Sushi.address
				)
			).to.not.reverted;
		});
	});
});
