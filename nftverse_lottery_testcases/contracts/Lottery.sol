// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./NFTVERSE.sol";
import "hardhat/console.sol";

contract Lottery{
    
    uint256 lotteryId = 0;

    uint256 nonce;

    NFTVERSE public token;

    enum lotteryStatus{notInitialized, Initialized, Completed}
    
    struct LotteryDetails{
        string title;
        uint256 threshold;
        uint256 numOfWinners;
        lotteryStatus status;
    }
    
    mapping(uint => LotteryDetails) public lotteryDetails;
    mapping(uint => address[]) private participants;
    mapping(uint => mapping(address => bool)) public registeredParticipants;
    mapping(uint => address[]) private winners;

    modifier onlyOwner(){
        require(msg.sender == token.NFTVERSE_wallet(),"You are not the contract owner");
        _;
    }

    constructor(address _token){
        token = NFTVERSE(_token);
        require(msg.sender == token.NFTVERSE_wallet(), "Deployer wallet must be NFTVERSE address");
    }

    function createLottery(string memory title, uint threshold, uint256 numOfWinners) external onlyOwner{
        lotteryId++;
        require(lotteryDetails[lotteryId].status == lotteryStatus.notInitialized,"Lottery is already initialized or completed");
        lotteryDetails[lotteryId]=LotteryDetails(title,threshold,numOfWinners,lotteryStatus.Initialized);
    }
   

    function registerParticipants(uint256 lotteryId) external{
        require(lotteryDetails[lotteryId].status == lotteryStatus.Initialized,"Lottery is already completed or not intialized");
        require(token.balanceOf(msg.sender) > 0,"You dont have a nft");
        require(registeredParticipants[lotteryId][msg.sender] == false, "your are already registered");
        registeredParticipants[lotteryId][msg.sender] = true;
        participants[lotteryId].push(msg.sender);

        if(getParticipants(lotteryId).length == lotteryDetails[lotteryId].threshold){
            pickWinners(lotteryId);
        }
    }

   
    function pickWinners(uint256 lotteryId) internal {
        require(lotteryDetails[lotteryId].status == lotteryStatus.Initialized,"Lottery is already completed or not intialized");
        uint256 totalWinners = lotteryDetails[lotteryId].numOfWinners;
        for(uint256 i = 0; i < totalWinners; i++){
            address[] memory _participants = getParticipants(lotteryId);
            uint256 randomNumber = generateRandom(_participants.length - 1);
            winners[lotteryId].push(_participants[randomNumber]);

            _participants[randomNumber] = _participants[_participants.length - 1];
            _participants = participantsPop(_participants);
            participants[lotteryId] = _participants;
            nonce++;
        }
        lotteryDetails[lotteryId].status = lotteryStatus.Completed;
    }

    function generateRandom(uint256 length) internal view returns(uint256){
        console.log("length = ", length);
        uint256 r_number = uint256(keccak256(abi.encodePacked(
            nonce,
            block.timestamp,
            block.difficulty,
            msg.sender) 
        ));
        r_number = (r_number % length) + 1;
        return r_number;
    }

    function participantsPop(address[] memory _participants) internal pure returns(address[] memory){
        address[] memory newParticipants = new address[](_participants.length - 1);
        for(uint i = 0; i < _participants.length - 1; i++){
            newParticipants[i] = _participants[i];
        }
        return newParticipants;
    }

    function getParticipants(uint256 lotteryId) public view returns(address[] memory){
        return participants[lotteryId];
    }
    
    function getWinners(uint256 lotteryId) public view returns(address[] memory){
        return winners[lotteryId];
    }
}