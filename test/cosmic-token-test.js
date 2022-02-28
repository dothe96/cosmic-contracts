const { expect } = require('chai');
const { ethers } = require('hardhat');
const Web3 = require('web3');
require('dotenv').config();

describe("Cosmic token test", function () {
  let cosmicToken, owner, recipient, wrongRecipient;
  const web3 = new Web3();
  const MINT_AMOUNT = web3.utils.toWei('5000000');

  beforeEach(async () => {
    [owner, recipient, wrongRecipient] = await ethers.getSigners();
    const token = await ethers.getContractFactory('Cosmic');
    cosmicToken = await token.deploy();
    cosmicToken.mint(owner.address, MINT_AMOUNT);
  });

  it("Should name of token is Cosmic", async () => {
    expect(await cosmicToken.name()).to.equal('Cosmic');
  });

  it("Should recipient receive tokens", async () => {
    const amount = web3.utils.toWei('100');
    await cosmicToken.transfer(recipient.address, amount);
    expect(await cosmicToken.balanceOf(recipient.address)).to.equal(amount);
  });
});
