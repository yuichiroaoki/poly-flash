import { aavePoolAddressesProvider } from "../constants/addresses";
import { Liquidations, Liquidations__factory } from "../typechain";
import { deployContractFromName } from "../utils";

async function main() {
  const Liquidations: Liquidations = await deployContractFromName(
    "Liquidations",
    Liquidations__factory,
    [aavePoolAddressesProvider]
  );
  await Liquidations.deployed();

  console.log("contract deployed to:", Liquidations.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
