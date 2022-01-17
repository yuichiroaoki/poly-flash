import { expect } from "chai";
import { ethers } from "hardhat";
import { erc20Address, dodoV2Pool } from "../constants/addresses";
import { ERC20Mock } from "../typechain";
import { getBigNumber, getERC20ContractFromAddress } from "../utils";

describe("DODO pool check", () => {
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
	});

	describe("Check if dodo pools have enough tokens", () => {
		for (const [name, poolAddr] of Object.entries(dodoV2Pool)) {
			it(name, async () => {
				const dodoPool = await ethers.getContractAt(
					"IDODO",
					poolAddr
				);
				expect((await dodoPool._BASE_RESERVE_()).gt(getBigNumber(1000, 6)))
				expect((await dodoPool._QUOTE_RESERVE_()).gt(getBigNumber(1000, 6)))
			});
		}
	});
});
