const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Cosmic", function () {
  it("Should return name is Cosmic", async function () {
    const Cosmic = await ethers.getContractFactory("Cosmic");
    const cosmic = await Cosmic.deploy();
    await cosmic.deployed();

    expect(await cosmic.name()).to.equal("Cosmic");
  });
});
