// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";

contract NFTVERSE is ERC721URIStorage{

    address public NFTVERSE_wallet;
    uint256 public mintFee; 

    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;

    struct NFT_DETAILS {
        address creator;
        address owner;
        address buyer;
        uint256 price;
        bool listed;
    }
    mapping(uint256 => NFT_DETAILS) private nftsDetails;
    
    struct Offers{
        address bidder;
        uint256 bidPrice;
    }
    mapping(uint256 => Offers[]) private offers;

    event NFT_Action(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool listed
    );

    constructor() ERC721("NFTVERSE", "NVS"){
        NFTVERSE_wallet = payable(msg.sender);
        mintFee = 0.00001 ether;
    }

    function createNFT(string memory tokenURI) external payable{
        require(msg.value == mintFee, "Price must be equal to listing price");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        nftsDetails[newTokenId].creator = msg.sender;
    }


    function listNFT(uint256 tokenId, uint256 price) public {  
        NFT_DETAILS memory nft_details = getNFT_Details(tokenId);    

        require(ownerOf(tokenId) == msg.sender, "You are not an Owner of this Token ID");
        require(nft_details.listed == false, "Token is already listed");
        require(price > 0, "Price must be at least 1 wei");

        nftsDetails[tokenId] = NFT_DETAILS(nft_details.creator, payable(msg.sender), address(0), price, true);
        
        emit NFT_Action(tokenId, msg.sender, address(0), price, true);
    }

    function cancelListing(uint256 tokenId) external{
         NFT_DETAILS memory nft_details = getNFT_Details(tokenId);

        require(ownerOf(tokenId) == msg.sender && nft_details.owner == msg.sender, "You are not an Owner of this Token ID");
        require(nft_details.listed == true, "Token is not listed");

        nftsDetails[tokenId] = NFT_DETAILS(nft_details.creator, payable(msg.sender), address(0), 0, false);
        
        emit NFT_Action(tokenId, msg.sender, address(0), 0, false);
    }

    function buyNFT(uint256 tokenId) external payable {
        NFT_DETAILS memory nft_details = getNFT_Details(tokenId);

        require(nft_details.listed == true, "Token is not listed");
        require(msg.value == nft_details.price, "InValid purchase Price");
        require(ownerOf(tokenId) != msg.sender && nft_details.owner != msg.sender, "Owner cannot Buy NFT");
        
        uint256 percentage = calculatePercentage(msg.value);
        uint256 actual = msg.value - percentage;
        payable(ownerOf(tokenId)).transfer(actual);
        payable(nft_details.creator).transfer(percentage);

        _transfer(ownerOf(tokenId), msg.sender, tokenId);
        nftsDetails[tokenId] = NFT_DETAILS(nft_details.creator, payable(msg.sender), msg.sender, 0, false);
    
        emit NFT_Action(tokenId, msg.sender, msg.sender, 0, false);
    }

    function placeBid(uint256 tokenId) external payable {
        NFT_DETAILS memory nft_details = getNFT_Details(tokenId);

        require(msg.value > 0, "Invalid Bid Price");
        require(ownerOf(tokenId) != msg.sender && nft_details.owner != msg.sender, "Owner cannot Bid");
        offers[tokenId].push(Offers(msg.sender, msg.value));
        emit NFT_Action(tokenId, nft_details.owner, msg.sender, msg.value, false);
    }

    function cancelBid(uint256 tokenId, uint256 index) external {
        Offers[] memory _offers = getOffers(tokenId); 
        NFT_DETAILS memory nft_details = getNFT_Details(tokenId);

        require(ownerOf(tokenId) != msg.sender && nft_details.owner != msg.sender, "Owner cannot Cancel Bid");
        require(_offers[index].bidder == msg.sender && _offers[index].bidPrice > 0, "Worng Bid Address or Bid Amount");
        
        payable(msg.sender).transfer(_offers[index].bidPrice);
        delete offers[tokenId][index];   
        
        emit NFT_Action(tokenId, nft_details.owner, msg.sender, 0, false);
    }

    function acceptOffer(uint256 tokenId, uint256 index) external {
        NFT_DETAILS memory nft_details = getNFT_Details(tokenId);
        Offers[] memory _offers = getOffers(tokenId);

        require(ownerOf(tokenId) == msg.sender, "Only Owner Can Accept Offer");
        require(_offers[index].bidder != msg.sender && _offers[index].bidPrice > 0, "Worng Bid Address or Bid Amount");
        
        uint256 percentage = calculatePercentage(_offers[index].bidPrice);
        uint256 actual =_offers[index].bidPrice - percentage;
        payable(msg.sender).transfer(actual);
        payable(nft_details.creator).transfer(percentage);

        _transfer(msg.sender, _offers[index].bidder, tokenId);
        nftsDetails[tokenId] = NFT_DETAILS(nft_details.creator, payable(_offers[index].bidder), _offers[index].bidder, 0, false);
        
        delete offers[tokenId][index];

        payBack(offers[tokenId]);
        delete offers[tokenId];
        
       //emit NFT_Action(tokenId, token, offers[token][tokenId][index].bidder, offers[token][tokenId][index].bidder, offers[token][tokenId][index].bidPrice, false);
    }

    function payBack(Offers[] memory _offers) internal{
        for(uint256 i=0; i<_offers.length; i++){
            if(_offers[i].bidder != address(0) && _offers[i].bidPrice > 0){
                console.log(address(this).balance);
                payable(_offers[i].bidder).transfer(_offers[i].bidPrice);
            }
        }
    }

    function calculatePercentage(uint256 price) internal pure returns(uint256){
        uint256 percentage = (price * 1) / 100;
        return percentage;
    }

    function viewListing(uint256 tokenId) public view returns(uint256){
        return nftsDetails[tokenId].price;
    } 

    function getNFT_Details(uint256 tokenId) public view returns(NFT_DETAILS memory){
       return nftsDetails[tokenId];
    }

    function getOffers(uint256 tokenId) public view returns(Offers[] memory){
        return offers[tokenId];
    }

    function nftverseWallet() external view returns(address){
       return NFTVERSE_wallet;
    }

}