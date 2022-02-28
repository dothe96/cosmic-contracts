const { expect } = require('chai');
const { ethers } = require('hardhat');
const Web3 = require('web3');
require('dotenv').config();

describe("Cosmic aridrop test", function () {
  let cosmicToken, cosmicAirdrop, owner, recipient, wrongRecipient;
  const web3 = new Web3();
  const MINT_AMOUNT = web3.utils.toWei('5000000');
  const AIRDROP_AMOUNT = web3.utils.toWei('100000');

  beforeEach(async () => {
    [owner, recipient, wrongRecipient] = await ethers.getSigners();
    const token = await ethers.getContractFactory('Cosmic');
    const airdrop = await ethers.getContractFactory('CosmicAirdrop');
    cosmicToken = await token.deploy();
    cosmicAirdrop = await airdrop.deploy(cosmicToken.address, owner.address);
    await cosmicToken.mint(owner.address, MINT_AMOUNT);
    await cosmicToken.transfer(cosmicAirdrop.address, AIRDROP_AMOUNT);
  });

  const createSignature = params => {
    params = { recipient: recipient.address, amount: 100, ...params };
    const message = web3.utils.soliditySha3(
      { t: 'address', v: params.recipient },
      { t: 'uint256', v: params.amount }
    ).toString('hex');
    const privateKey = process.env.OWNER_PRIVATE_KEY;
    const { signature } = web3.eth.accounts.sign(
      message,
      privateKey
    );

    return { signature, recipient: params.recipient, amount: params.amount };
  }

  it("Should onwer is set as admin", async () => {
    expect(await cosmicAirdrop.admin()).to.equal(owner.address);
  });

  it("Should balance of airdrop contract is 100000", async () => {
    expect(await cosmicToken.balanceOf(cosmicAirdrop.address)).to.equal(AIRDROP_AMOUNT);
  });

  it('Should airdrop', async () => {
    const { signature, recipient, amount } = createSignature();
    await cosmicAirdrop.claimTokens(recipient, amount, signature);
    const balance = await cosmicToken.balanceOf(recipient);
    expect(balance).to.equal(amount);
  });

  it('Should not airdrop twice for same address', async () => {
    const { signature, recipient, amount } = createSignature();
    await cosmicAirdrop.claimTokens(recipient, amount, signature);
    await expect(cosmicAirdrop.claimTokens(recipient, amount, signature)).to.be.revertedWith('airdrop already processed');
  });

  it('Should not airdrop above airdrop limit', async () => {
    const { signature, recipient, amount } = createSignature({
      amount: web3.utils.toWei('100001')
    });
    await expect(cosmicAirdrop.claimTokens(recipient, amount, signature)).to.be.revertedWith('airdropped 100% of the tokens');
  });

  it('Should not airdrop if wrong recipient', async () => {
    const { signature, recipient, amount } = createSignature();
    await expect(cosmicAirdrop.claimTokens(wrongRecipient.address, amount, signature)).to.be.revertedWith('wrong signature');
  });

  it('Should not airdrop if wrong amount', async () => {
    const { signature, recipient, amount } = createSignature();
    const wrongAmount = '111';
    await expect(cosmicAirdrop.claimTokens(recipient, wrongAmount, signature)).to.be.revertedWith('wrong signature');
  });

  it('Should not airdrop if wrong signature', async () => {
    const { signature, recipient, amount } = createSignature();
    const wrongSignature = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    await expect(cosmicAirdrop.claimTokens(recipient, amount, wrongSignature)).to.be.revertedWith('wrong signature');
  });
});
