const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContractDrafter", function () {
  let contractDrafter;
  let owner, partyA, partyB;

  beforeEach(async function () {
    [owner, partyA, partyB] = await ethers.getSigners();
    const ContractDrafter = await ethers.getContractFactory("ContractDrafter");
    contractDrafter = await ContractDrafter.deploy();
    await contractDrafter.deployed();
  });

  it("should create an agreement", async function () {
    const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("agreement terms"));
    await contractDrafter.connect(partyA).createAgreement(partyB.address, contentHash);
    const agreement = await contractDrafter.getAgreement(0);
    expect(agreement.partyA).to.equal(partyA.address);
    expect(agreement.partyB).to.equal(partyB.address);
    expect(agreement.contentHash).to.equal(contentHash);
    expect(agreement.signedByA).to.be.false;
    expect(agreement.signedByB).to.be.false;
    expect(agreement.finalized).to.be.false;
  });

  it("should allow parties to sign", async function () {
    const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("terms"));
    await contractDrafter.connect(partyA).createAgreement(partyB.address, contentHash);
    await contractDrafter.connect(partyA).signAgreement(0);
    await contractDrafter.connect(partyB).signAgreement(0);
    const agreement = await contractDrafter.getAgreement(0);
    expect(agreement.signedByA).to.be.true;
    expect(agreement.signedByB).to.be.true;
  });

  it("should finalize after both sign", async function () {
    const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("terms"));
    await contractDrafter.connect(partyA).createAgreement(partyB.address, contentHash);
    await contractDrafter.connect(partyA).signAgreement(0);
    await contractDrafter.connect(partyB).signAgreement(0);
    await contractDrafter.connect(partyA).finalizeAgreement(0);
    const agreement = await contractDrafter.getAgreement(0);
    expect(agreement.finalized).to.be.true;
  });

  it("should not allow non-party to sign", async function () {
    const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("terms"));
    await contractDrafter.connect(partyA).createAgreement(partyB.address, contentHash);
    await expect(contractDrafter.connect(owner).signAgreement(0)).to.be.revertedWith("Not a party to this agreement");
  });

  it("should enforce unique content hash", async function () {
    const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("terms"));
    await contractDrafter.connect(partyA).createAgreement(partyB.address, contentHash);
    await expect(contractDrafter.connect(partyA).createAgreement(partyB.address, contentHash)).to.be.revertedWith("Content hash already used");
  });
});
