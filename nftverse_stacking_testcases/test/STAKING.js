const { expect } = require("chai");
const {BigNumber} = require ("ethers");
const {time} = require("@nomicfoundation/hardhat-network-helpers");
const ONE_DAY_IN_SECS = 1 * 24 * 60 * 60;

describe("NFTVERSE Contract's flow test", async() => {

    let Staking, staking, addr1, addr2;
    let Nftverse, nftverse; 

    before(async()=>{
      // Contracts are deployed using the first signer/account by default
      [addr1, addr2] = await ethers.getSigners();
      
      Nftverse = await ethers.getContractFactory("NFTVERSE");
      nftverse = await Nftverse.deploy();
      console.log("NFTVERSE Contract Address: ", nftverse.address);

      Staking = await ethers.getContractFactory("NFTVERSE_STAKING");
      staking = await Staking.deploy(nftverse.address);
      console.log("Staking Contract Address: ", staking.address);

      await addr1.sendTransaction({
        to: staking.address,
        value: ethers.utils.parseEther("10.0"), 
      });

      const stakingContractBalance = await ethers.provider.getBalance(staking.address);
      console.log("Staking contract balance = ", stakingContractBalance);

    })

    describe("after Deployment", function () {
      it("Should return the right deployer", async function () {
        expect(await nftverse.NFTVERSE_wallet()).to.equal(addr1.address);
      });
    });

    describe("Create NFT", function () {
      it("NFT should be minted", async function () {
        let mintPrice = BigNumber.from(await nftverse.mintFee());
        mintPrice = ethers.utils.formatEther(mintPrice);
        await expect(nftverse.connect(addr2).createNFT("abcd", {value: ethers.utils.parseEther(mintPrice)})).not.to.be.reverted;
        await expect(nftverse.connect(addr2).createNFT("abcd", {value: ethers.utils.parseEther(mintPrice)})).not.to.be.reverted;
        await expect(nftverse.connect(addr2).createNFT("abcd", {value: ethers.utils.parseEther(mintPrice)})).not.to.be.reverted;
        await expect(nftverse.connect(addr2).createNFT("abcd", {value: ethers.utils.parseEther(mintPrice)})).not.to.be.reverted;
      
        console.log("balanceOf after minting = ", await nftverse.balanceOf(addr2.address))
      });
    });

    describe("Stake NFT", function () {
      it("NFT should be staked", async function () {
        await expect(nftverse.connect(addr2).approve(staking.address, 1)).not.to.be.reverted;
        await expect(staking.connect(addr2).stakeNFT(1, 1)).not.to.be.reverted;

        // await expect(nftverse.connect(addr2).approve(staking.address, 2)).not.to.be.reverted;
        // await expect(staking.connect(addr2).stakeNFT(2, 2)).not.to.be.reverted;

        // await expect(nftverse.connect(addr2).approve(staking.address, 3)).not.to.be.reverted;
        // await expect(staking.connect(addr2).stakeNFT(3, 3)).not.to.be.reverted;
        
        console.log("balanceOf after stacking = ", await nftverse.balanceOf(addr2.address));

      });
    });

    describe("Calculate Reward", function () {

      it("Should be calculate Reward for weekly staking", async function () {
        let currentTime = await time.latest();
        for(let i=0; i<=6; i++){
            if(i!=0){
              const newTime = (currentTime + (ONE_DAY_IN_SECS * i));
              await time.increaseTo(newTime);
            }
            let reward = await staking.calculateReward(addr2.address, 1);
            console.log("Reward =", reward);
        }
      });

      // it("Should be calculate Reward for monthly staking", async function () {
      //   let currentTime = await time.latest();
      //   for(let i=0; i<=31; i++){
      //       if(i!=0){
      //         const newTime = (currentTime + (ONE_DAY_IN_SECS * i));
      //         await time.increaseTo(newTime);
      //       }
      //       let reward = await staking.calculateReward(addr2.address, 2);
      //       console.log("Reward =", reward);
      //   }
      // });

      // it("Should be calculate Reward for quaterly staking", async function () {
      //   let currentTime = await time.latest();
      //   for(let i=0; i<=93; i++){
      //       if(i!=0){
      //         const newTime = (currentTime + (ONE_DAY_IN_SECS * i));
      //         await time.increaseTo(newTime);
      //       }
      //       let reward = await staking.calculateReward(addr2.address, 3);
      //       console.log("Reward =", reward);
      //   }
      // });

        // it("Should be claim Reward", async function () {
        //   await expect(staking.connect(addr2).claimReward(1)).not.to.be.reverted;

        //   const stakingContractBalance = await ethers.provider.getBalance(staking.address);
        //   console.log("Staking contract balance = ", stakingContractBalance);
        //   console.log("balance Of = ", await nftverse.balanceOf(addr2.address));
        // });


        it("Should be unStake", async function () {
          await expect(staking.connect(addr2).unStakeNFT(1)).not.to.be.reverted;

          const stakingContractBalance = await ethers.provider.getBalance(staking.address);
          console.log("Staking contract balance = ", stakingContractBalance);
          console.log("balance Of = ", await nftverse.balanceOf(addr2.address));
        });

        // it("Should be unStake and claim Reward", async function () {
        //   await expect(staking.connect(addr2).unStakeNFT(1)).not.to.be.reverted;

        //   const stakingContractBalance = await ethers.provider.getBalance(staking.address);
        //   console.log("Staking contract balance = ", stakingContractBalance);
        //   console.log("balance Of = ", await nftverse.balanceOf(addr2.address));
        // });

    });


    describe("Widthdraw ETH from Stacking Contract", function () {
      it("Should be reverted when widthdraw from invalid address", async function () {
        await expect(staking.connect(addr2).widthdrawEth()).to.be.revertedWith("Owner wallet must be NFTVERSE address");
      });
      it("Should be tranfered ETH to owner wallet", async function () {
        await expect(staking.connect(addr1).widthdrawEth()).not.to.be.reverted;

        const stakingContractBalance = await ethers.provider.getBalance(staking.address);
        console.log("Staking contract balance = ", stakingContractBalance);
      })
    });

});