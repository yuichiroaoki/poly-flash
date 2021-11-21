import { network, ethers } from "hardhat";
import { Contract } from "ethers";

export const getErc20Balance = async (
  contract: Contract,
  address: string,
  name: string,
  decimals: number
) => {
  const [balance] = await Promise.all([contract.balanceOf(address)]);

  console.log(name, ethers.utils.formatUnits(balance, decimals));
};

export const fundErc20 = async (
  contract: Contract,
  sender: string,
  recepient: string,
  amount: string,
  decimals: number
) => {
  const FUND_AMOUNT = ethers.utils.parseUnits(amount, decimals);

  // fund erc20 token to the contract
  const MrWhale = await ethers.getSigner(sender);

  const contractSigner = contract.connect(MrWhale);
  await contractSigner.transfer(recepient, FUND_AMOUNT);
};

export const impersonateFundErc20 = async (
  contract: Contract,
  sender: string,
  recepient: string,
  amount: string,
  decimals: number = 18
) => {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [sender],
  });

  // fund baseToken to the contract
  await fundErc20(contract, sender, recepient, amount, decimals);

  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [sender],
  });
};
