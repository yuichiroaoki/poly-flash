import { ethers } from "hardhat";

async function main() {
  const protocolFeesCollector = "0xce88686553686da562ce7cea497ce749da109f9f";
  const ProtocolFeesCollector = await ethers.getContractAt(
    "IProtocolFeesCollector",
    protocolFeesCollector
  );
  const fee = await ProtocolFeesCollector.getFlashLoanFeePercentage();
  console.log("balancer flashloan fee percentage:", fee.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
