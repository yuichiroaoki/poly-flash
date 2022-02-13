import { Flashloan, Flashloan__factory } from "../typechain";
import { deployContractFromName } from "../utils";

async function main() {
  const Flashloan: Flashloan = await deployContractFromName(
    "Flashloan",
    Flashloan__factory
  );
  await Flashloan.deployed();

  console.log("contract deployed to:", Flashloan.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
