//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./NFTVERSE.sol";
import "hardhat/console.sol";

contract NFTVERSE_STAKING{

    uint256 public totalStacked = 0; 

    //  Stake Duration:
    //     1 for Weekly
    //     2 for Monthly
    //     3 for Quaterly
    uint256 weeklyReward = 0.001 ether;
    uint256 monthlyReward = 0.01 ether;
    uint256 quaterlyReward = 0.1 ether;
   
    NFTVERSE public token;

    struct Stacking{
        uint256 stakeTime;
        uint256 stakeDuration; 
        uint256 stakeType;
        bool isStaked;
    }

    mapping(address => mapping(uint256 => Stacking)) private NFTStaked;
    mapping(address => uint256) public userStakedNFTs;
    mapping(uint256 => address) public stakeWallet;


    constructor(address _token){
        token = NFTVERSE(_token);
        require(msg.sender == token.NFTVERSE_wallet(), "Deployer wallet must be NFTVERSE address");
    }

    receive() external payable{}

    function stakeNFT(uint256 tokenId, uint256 stakeType) external {
        require(token.balanceOf(msg.sender) >= 1, "not enough NFTs for Stacking");
        require(token.ownerOf(tokenId) == msg.sender, "You are not an Owner of this NFT");
        require(!getStakingData(msg.sender,tokenId).isStaked, "NFT is already Staked");
        require(stakeType > 0 && stakeType <= 4, "Invalid Staking Type");

        if(stakeType == 1){
            NFTStaked[msg.sender][tokenId] = Stacking(block.timestamp, block.timestamp + 1 weeks, stakeType ,true);
        }
        else if(stakeType == 2){
            NFTStaked[msg.sender][tokenId] = Stacking(block.timestamp, block.timestamp + 30 days, stakeType,true);
        }
        else if(stakeType == 3){
            NFTStaked[msg.sender][tokenId] = Stacking(block.timestamp, block.timestamp + 92 days, stakeType ,true);
        }
        token.transferFrom(msg.sender,address(this), tokenId);
        userStakedNFTs[msg.sender] += 1;
        stakeWallet[tokenId] = msg.sender;
        totalStacked += 1;
    }

    function unStakeNFT(uint256 tokenId) external {
        require(userStakedNFTs[msg.sender] > 0, "You have not stake any NFT");
        require(getStakingData(msg.sender,tokenId).isStaked, "This NFT is not Staked");

        if(block.timestamp >= getStakingData(msg.sender, tokenId).stakeDuration){
            claimReward(tokenId);
        }
        else{
            token.safeTransferFrom(address(this), msg.sender, tokenId);
            NFTStaked[msg.sender][tokenId] = Stacking(0, 0, 0,false);
            userStakedNFTs[msg.sender] -= 1;
            stakeWallet[tokenId] = address(0);
            totalStacked -= 1;
        }
    }

    function claimReward(uint256 tokenId) public{
        require(userStakedNFTs[msg.sender] > 0, "You have not stake any NFT");
        require(getStakingData(msg.sender,tokenId).isStaked, "This NFT is not Staked");
        require(block.timestamp >= getStakingData(msg.sender, tokenId).stakeDuration, "Your stacking time is not completed");
        
        uint256 stakeType = getStakingData(msg.sender, tokenId).stakeType;
        
        if(stakeType == 1){
            payable(msg.sender).transfer(weeklyReward);
        }
        else if(stakeType == 2){
            payable(msg.sender).transfer(monthlyReward);
        }
        else if(stakeType == 3){
            payable(msg.sender).transfer(quaterlyReward);
        }

        token.safeTransferFrom(address(this),msg.sender, tokenId);
        NFTStaked[msg.sender][tokenId] = Stacking(0, 0, 0,false);
        userStakedNFTs[msg.sender] -= 1;
        stakeWallet[tokenId] = address(0);
        totalStacked -= 1;
    }

    function getStakingData(address addr, uint256 tokenId) public view returns(Stacking memory){
        return NFTStaked[addr][tokenId];
    }

    function calculateReward(address addr, uint256 tokenId) public view returns(uint){
        uint256 stakeTime = getStakingData(addr, tokenId).stakeTime;
        uint256 duration = getStakingData(addr, tokenId).stakeDuration;
        uint256 stakeType = getStakingData(addr, tokenId).stakeType;

        if(block.timestamp < duration){
            uint256 totalDaysInSeconds = block.timestamp - stakeTime;
            uint256 secondsInOneDay = 86400;
            uint256 stakeDays =  totalDaysInSeconds / secondsInOneDay;
            
            if(stakeType == 1){
                uint256 reward = (weeklyReward / 7) * stakeDays;
                return reward; 
            }
            else if(stakeType == 2){
                uint256 reward = (monthlyReward / 30) * stakeDays;
                return reward; 
            }
            else{
                uint256 reward = (quaterlyReward / 92) * stakeDays;
                return reward;
            }
        }
        else{
            if(stakeType == 1){
                return weeklyReward; 
            }
            else if(stakeType == 2){
                return monthlyReward; 
            }
            else{
                return quaterlyReward; 
            }
        }
        
    }

    function widthdrawEth() external {
        require(msg.sender == token.NFTVERSE_wallet(), "Owner wallet must be NFTVERSE address");
        payable(msg.sender).transfer(address(this).balance);
    }

}