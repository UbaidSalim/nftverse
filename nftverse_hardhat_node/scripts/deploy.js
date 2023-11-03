// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
 
  // const Nftverse = await hre.ethers.getContractFactory("NFTVERSE");
  // const nftverse = await Nftverse.deploy();
  // await nftverse.deployed();
  // console.log(`NFTVERSE deployed to ${nftverse.address}`);

  // const Lottery = await hre.ethers.getContractFactory("Lottery");
  // const lottery = await Lottery.deploy("0x50CbBef7f41BAa59A64Baf9b17a1F04A3D2f4FCA");
  // await lottery.deployed();
  // console.log(`LOTTERY deployed to ${lottery.address}`);

  const Stacking = await hre.ethers.getContractFactory("NFTVERSE_STAKING");
  const stacking = await Stacking.deploy("0xbAeb166E062C2cDd5fBc58c0cf13A037F5D5FD52");
  await stacking.deployed();
  console.log(`STACKING deployed to ${stacking.address}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
