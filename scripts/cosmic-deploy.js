const hre = require("hardhat");
const Web3 = require('web3');
const web3 = new Web3();
const MINT_AMOUNT = web3.utils.toWei('5000000');
const AIRDROP_AMOUNT = web3.utils.toWei('100000');

const deploy = async () => {
  const owner = await hre.ethers.getSigner();
  const CosmicToken = await hre.ethers.getContractFactory("Cosmic");
  const cosmicToken = await CosmicToken.deploy();
  await cosmicToken.deployed();

  await cosmicToken.mint(owner.address, MINT_AMOUNT);
  const balanceOfOwner = await cosmicToken.balanceOf(owner.address);
  console.log(`Cosmic token deployed to: ${cosmicToken.address} with owner: ${owner.address}`);
  
  const CosmicAirdrop = await hre.ethers.getContractFactory("CosmicAirdrop");
  const cosmicAirdrop = await CosmicAirdrop.deploy(cosmicToken.address, owner.address);
  await cosmicAirdrop.deployed();

  await cosmicToken.transfer(cosmicAirdrop.address, AIRDROP_AMOUNT);
  const balanceOfAirdrop = await cosmicToken.balanceOf(cosmicAirdrop.address);
  console.log(`Cosmic airdrop deployed to: ${cosmicAirdrop.address} with owner: ${owner.address}`);
  console.log(`Balance of Owner: ${web3.utils.fromWei(balanceOfOwner.toString())}. Balance of airdrop: ${web3.utils.fromWei(balanceOfAirdrop.toString())}`);
};

(() => {
  deploy()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(0);
    });
})();
