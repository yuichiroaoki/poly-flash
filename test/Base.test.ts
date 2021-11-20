import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Base__factory, Base } from "../typechain";

describe("Base", () => {
  let Base: Base;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const provider = ethers.provider;

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const BaseFactory = (await ethers.getContractFactory(
      "Base",
      owner
    )) as Base__factory;
    Base = await BaseFactory.deploy();
    await Base.deployed();
  });

  it("Should increase the balance of the contract", async () => {
    expect(await provider.getBalance(Base.address)).to.equal(
      ethers.BigNumber.from(0)
    );

    await owner.sendTransaction({
      to: Base.address,
      value: ethers.utils.parseEther("1.0"),
    });

    expect(await provider.getBalance(Base.address)).to.equal(
      ethers.utils.parseEther("1.0")
    );
  });

  it("Should be reverted because it is not called by the owner", async () => {
    expect(await Base.owner()).to.equal(owner.address);

    await owner.sendTransaction({
      to: Base.address,
      value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
    });

    await expect(
      Base.connect(addr1).withdraw(
        owner.address,
        ethers.utils.parseEther("1.0")
      )
    ).to.be.reverted;
  });

  it("Should return the new storedValue once it's changed", async function () {
    expect(await Base.getStoredValue()).to.equal(0);
    await Base.setStoredValue(1000);
    expect(await Base.getStoredValue()).to.equal(1000);
  });
});
