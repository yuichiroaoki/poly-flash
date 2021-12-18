import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import * as IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";
import {
	DODOFlashloan,
	DODOFlashloan__factory,
} from "../typechain";
import { dodoV2Pool, polyDAI } from "../constrants/addresses"
import { Contract } from "@ethersproject/contracts";
import { getBigNumber } from "../utils"

describe("dodo flashloan", () => {
	let Sample: DODOFlashloan;
	let owner: SignerWithAddress;
	let addr1: SignerWithAddress;
	let addr2: SignerWithAddress;
	let addrs: SignerWithAddress[];
	let DAI: Contract;

	const provider = ethers.provider;
	let fixture: any;

	before(async () => {
		fixture = async () => {
			[owner, addr1, addr2, ...addrs] = await ethers.getSigners();

			const factory = (await ethers.getContractFactory(
				"DODOFlashloan"
			)) as DODOFlashloan__factory;
			Sample = await factory.deploy();

			await Sample.deployed()

			DAI = new ethers.Contract(
				polyDAI, IERC20.abi, provider
			)
		};
	});

	beforeEach(async () => {
		await fixture();
	});

	describe("DODO flashloan", async () => {

		it("should execute flashloan", async () => {
			// borrowing 1000 DAI from DODOs USDC/DAI pool
			await expect(
				Sample.dodoFlashLoan(
					dodoV2Pool.USDC_DAI,
					getBigNumber(1000),
					polyDAI
				)
			)
				.emit(Sample, "checkBorrowedAmount")
				.withArgs(polyDAI, getBigNumber(1000))
				.emit(Sample, "payBackLoan")
				.withArgs(polyDAI, getBigNumber(1000));
		});

	});
});