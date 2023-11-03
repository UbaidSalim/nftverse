const { expect } = require("chai");
const {BigNumber} = require ("ethers");

describe("NFTVERSE Contract's flow test", async() => {

    let Nftverse, nftverse, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9;
    let Lottery, lottery; 

    before(async()=>{
      // Contracts are deployed using the first signer/account by default
      [addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9] = await ethers.getSigners();
      
      Nftverse = await ethers.getContractFactory("NFTVERSE");
      nftverse = await Nftverse.deploy();
      console.log("NFTVERSE Contract Address: ", nftverse.address);

      Lottery = await ethers.getContractFactory("Lottery");
      lottery = await Lottery.deploy(nftverse.address);
      console.log("Lottery Contract Address: ", lottery.address);

    })

    describe("after Deployment", function () {
      it("Should return the right deployer", async function () {
        expect(await nftverse.NFTVERSE_wallet()).to.equal(addr1.address);
      });
    });

    describe("Create Lottery", function () {
      it("lottery should be created", async function () {
        await expect(lottery.createLottery(1, "abc", 8, 5)).not.to.be.reverted;
      });
    });

    describe("Create NFT", function () {
      it("NFT should be minted", async function () {
        let mintPrice = BigNumber.from(await nftverse.mintFee());
        mintPrice = ethers.utils.formatEther(mintPrice);
        await expect(nftverse.connect(addr2).createNFT("aaa", {value: ethers.utils.parseEther(mintPrice)})).not.to.be.reverted;
        await expect(nftverse.connect(addr3).createNFT("aaa", {value: ethers.utils.parseEther(mintPrice)})).not.to.be.reverted;
        await expect(nftverse.connect(addr4).createNFT("aaa", {value: ethers.utils.parseEther(mintPrice)})).not.to.be.reverted;
        await expect(nftverse.connect(addr5).createNFT("aaa", {value: ethers.utils.parseEther(mintPrice)})).not.to.be.reverted;
        await expect(nftverse.connect(addr6).createNFT("aaa", {value: ethers.utils.parseEther(mintPrice)})).not.to.be.reverted;
        await expect(nftverse.connect(addr7).createNFT("aaa", {value: ethers.utils.parseEther(mintPrice)})).not.to.be.reverted;
        await expect(nftverse.connect(addr8).createNFT("aaa", {value: ethers.utils.parseEther(mintPrice)})).not.to.be.reverted;
        await expect(nftverse.connect(addr9).createNFT("aaa", {value: ethers.utils.parseEther(mintPrice)})).not.to.be.reverted;
      });
    });

    describe("Register Participants", function () {
      it("participants should be reristered", async function () {
        let mintPrice = BigNumber.from(await nftverse.mintFee());
        mintPrice = ethers.utils.formatEther(mintPrice);
        await expect(lottery.connect(addr2).registerParticipants(1)).not.to.be.reverted;
        await expect(lottery.connect(addr3).registerParticipants(1)).not.to.be.reverted;
        await expect(lottery.connect(addr4).registerParticipants(1)).not.to.be.reverted;
        await expect(lottery.connect(addr5).registerParticipants(1)).not.to.be.reverted;
        await expect(lottery.connect(addr6).registerParticipants(1)).not.to.be.reverted;
        await expect(lottery.connect(addr7).registerParticipants(1)).not.to.be.reverted;
        await expect(lottery.connect(addr8).registerParticipants(1)).not.to.be.reverted;
        await expect(lottery.connect(addr9).registerParticipants(1)).not.to.be.reverted;
      });
    });

    describe("get Partcipants", function () {
      it("should return participants", async function () {
        console.log(`participants = `, await lottery.getParticipants(1));
      });
    });

    describe("get Winners", function () {
      it("should return winners", async function () {
        console.log(`winners = `, await lottery.getWinners(1));
      });
    });



 
});