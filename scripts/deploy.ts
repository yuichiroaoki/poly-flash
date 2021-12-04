import { ethers } from "hardhat";
import { Flashloan, Flashloan__factory } from "../typechain";

async function main() {
	let Flashloan: Flashloan;

	const factory = (
		await ethers.getContractFactory("Flashloan")
	) as Flashloan__factory;

	Flashloan = await factory.deploy();
	await Flashloan.deployed();

	console.log("contract deployed to:", Flashloan.address);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
