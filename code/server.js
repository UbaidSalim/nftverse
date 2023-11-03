const express = require("express")
const app = express()
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const _Common = require('ethereumjs-common');
const Common = _Common.default;
require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST)
const bodyParser = require("body-parser")
const jsonParser = bodyParser.json()
const cors = require("cors")

const web3 = new Web3('https://polygon-mumbai.g.alchemy.com/v2/RxY_NHTJ7OfxgRfpDXh9XfderPxaBRE3');
const common = Common.forCustomChain('mainnet', {
    name: 'matic',
    networkId: 80001,
    chainId: 80001
}, 'petersburg');

const NFTVERSE_ABI = [
	{
	  "inputs": [],
	  "stateMutability": "nonpayable",
	  "type": "constructor"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "approved",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "Approval",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "operator",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "bool",
		  "name": "approved",
		  "type": "bool"
		}
	  ],
	  "name": "ApprovalForAll",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "indexed": false,
		  "internalType": "address",
		  "name": "seller",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "uint256",
		  "name": "price",
		  "type": "uint256"
		},
		{
		  "indexed": false,
		  "internalType": "bool",
		  "name": "listed",
		  "type": "bool"
		}
	  ],
	  "name": "NFT_Action",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "from",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "to",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "Transfer",
	  "type": "event"
	},
	{
	  "inputs": [],
	  "name": "NFTVERSE_wallet",
	  "outputs": [
		{
		  "internalType": "address",
		  "name": "",
		  "type": "address"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "_tokenIds",
	  "outputs": [
		{
		  "internalType": "uint256",
		  "name": "_value",
		  "type": "uint256"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "index",
		  "type": "uint256"
		}
	  ],
	  "name": "acceptOffer",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "to",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "approve",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		}
	  ],
	  "name": "balanceOf",
	  "outputs": [
		{
		  "internalType": "uint256",
		  "name": "",
		  "type": "uint256"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "buyNFT",
	  "outputs": [],
	  "stateMutability": "payable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "index",
		  "type": "uint256"
		}
	  ],
	  "name": "cancelBid",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "cancelListing",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "string",
		  "name": "tokenURI",
		  "type": "string"
		}
	  ],
	  "name": "createNFT",
	  "outputs": [],
	  "stateMutability": "payable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "getApproved",
	  "outputs": [
		{
		  "internalType": "address",
		  "name": "",
		  "type": "address"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "getNFT_Details",
	  "outputs": [
		{
		  "components": [
			{
			  "internalType": "address",
			  "name": "creator",
			  "type": "address"
			},
			{
			  "internalType": "address",
			  "name": "owner",
			  "type": "address"
			},
			{
			  "internalType": "address",
			  "name": "buyer",
			  "type": "address"
			},
			{
			  "internalType": "uint256",
			  "name": "price",
			  "type": "uint256"
			},
			{
			  "internalType": "bool",
			  "name": "listed",
			  "type": "bool"
			}
		  ],
		  "internalType": "struct NFTVERSE.NFT_DETAILS",
		  "name": "",
		  "type": "tuple"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "getOffers",
	  "outputs": [
		{
		  "components": [
			{
			  "internalType": "address",
			  "name": "bidder",
			  "type": "address"
			},
			{
			  "internalType": "uint256",
			  "name": "bidPrice",
			  "type": "uint256"
			}
		  ],
		  "internalType": "struct NFTVERSE.Offers[]",
		  "name": "",
		  "type": "tuple[]"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "operator",
		  "type": "address"
		}
	  ],
	  "name": "isApprovedForAll",
	  "outputs": [
		{
		  "internalType": "bool",
		  "name": "",
		  "type": "bool"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "price",
		  "type": "uint256"
		}
	  ],
	  "name": "listNFT",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "mintFee",
	  "outputs": [
		{
		  "internalType": "uint256",
		  "name": "",
		  "type": "uint256"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "name",
	  "outputs": [
		{
		  "internalType": "string",
		  "name": "",
		  "type": "string"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "nftverseWallet",
	  "outputs": [
		{
		  "internalType": "address",
		  "name": "",
		  "type": "address"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "ownerOf",
	  "outputs": [
		{
		  "internalType": "address",
		  "name": "",
		  "type": "address"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "placeBid",
	  "outputs": [],
	  "stateMutability": "payable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "from",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "to",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "safeTransferFrom",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "from",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "to",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "bytes",
		  "name": "data",
		  "type": "bytes"
		}
	  ],
	  "name": "safeTransferFrom",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "operator",
		  "type": "address"
		},
		{
		  "internalType": "bool",
		  "name": "approved",
		  "type": "bool"
		}
	  ],
	  "name": "setApprovalForAll",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "bytes4",
		  "name": "interfaceId",
		  "type": "bytes4"
		}
	  ],
	  "name": "supportsInterface",
	  "outputs": [
		{
		  "internalType": "bool",
		  "name": "",
		  "type": "bool"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "symbol",
	  "outputs": [
		{
		  "internalType": "string",
		  "name": "",
		  "type": "string"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "tokenURI",
	  "outputs": [
		{
		  "internalType": "string",
		  "name": "",
		  "type": "string"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "from",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "to",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "transferFrom",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "viewListing",
	  "outputs": [
		{
		  "internalType": "uint256",
		  "name": "",
		  "type": "uint256"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	}
];
  
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(cors())

app.post("/payment", cors(), async (req, res) => {
	let { amount, id } = req.body
	try {
		const payment = await stripe.paymentIntents.create({
			amount,
			currency: "USD",
			description: "Paid to NFTVERSE",
			payment_method: id,
			confirm: true
		})
		console.log("Payment", payment)
		res.json({
			message: "Payment successful",
			success: true
		})
	} catch (error) {
		console.log("Error", error)
		res.json({
			message: "Payment failed",
			success: false
		})
	}
})

app.post("/mintThroughStripe", jsonParser, async(req, res) => {
	// return payment_id, token_id, success, transactionHash
	let { payment_id ,contract_address, baseUri, mintFee} = req.body 
	let accountAddres = "0x452eeBE866E34bF31c202295792eEa95bEcCBE1d";
	let privateKey = "ac45a85d5f9fbec1a64e8c7f4ab2dc57b54486208457de30b9074d36c8cdfa9b";

	const gasPrice1 = await web3.eth.getGasPrice();
    const privateKeyBuffer = Buffer.from(privateKey,'hex');
    try{
		const contract_instance = new web3.eth.Contract(NFTVERSE_ABI, contract_address);
		let token_id = await contract_instance.methods._tokenIds().call();
		token_id++;

        const nonce = await web3.eth.getTransactionCount(accountAddres, 'latest'); 
        const txObject = {
            nonce: web3.utils.toHex(nonce),
            gasLimit: web3.utils.toHex(String(4000000)),
			maxPriorityFeePerGas:  web3.utils.toHex(String(40000000000)),
            gasPrice: web3.utils.toHex(String(gasPrice1).toString()),
			value: web3.utils.toHex(String(web3.utils.toWei(mintFee.toString(), 'ether'))),
            data: await contract_instance.methods.createNFT(baseUri).encodeABI(),
            to: contract_address
        }

        const tx = new Tx.Transaction(txObject, {common})
        tx.sign(privateKeyBuffer);

        const serializedTx = tx.serialize();
        const raw = '0x' + serializedTx.toString('hex');

        let receipt = await web3.eth.sendSignedTransaction(raw);
        
        res.json({
			message: "Minted Successful",
			success: true,
			nft_id: token_id,
			payment_id: payment_id,
			transactionHash: receipt.transactionHash,
		})
    }
    catch(error){
        console.log("Error: ", error.message);
		res.json({
			message: `Minted Unsuccessful, ${error.message}`,
			success: false,
		})
    }
})

app.post("/claimNFT", jsonParser, async(req, res) => {
	let { contract_address, wallet_address, token_id } = req.body 
	let accountAddres = "0x452eeBE866E34bF31c202295792eEa95bEcCBE1d";
	let privateKey = "ac45a85d5f9fbec1a64e8c7f4ab2dc57b54486208457de30b9074d36c8cdfa9b";

	const gasPrice1 = await web3.eth.getGasPrice();
    const privateKeyBuffer = Buffer.from(privateKey,'hex');
    try{
		const contract_instance = new web3.eth.Contract(NFTVERSE_ABI, contract_address);

        const nonce = await web3.eth.getTransactionCount(accountAddres, 'latest'); 
        const txObject = {
            nonce: web3.utils.toHex(nonce),
            gasLimit: web3.utils.toHex(String(4000000)),
			maxPriorityFeePerGas:  web3.utils.toHex(String(40000000000)),
            gasPrice: web3.utils.toHex(String(gasPrice1).toString()),
            data: await contract_instance.methods.safeTransferFrom(accountAddres, wallet_address, token_id).encodeABI(),
            to: contract_address
        }

        const tx = new Tx.Transaction(txObject, {common})
        tx.sign(privateKeyBuffer);

        const serializedTx = tx.serialize();
        const raw = '0x' + serializedTx.toString('hex');

        let receipt = await web3.eth.sendSignedTransaction(raw);
        
        res.json({
			message: "Transfered Successful",
			success: true,
			nft_id: token_id,
			transactionHash: receipt.transactionHash,
		})
    }
    catch(error){
        console.log("Error: ", error.message);
		res.json({
			message: `Transfered Unsuccessful, ${error.message}`,
			success: false,
		})
    }
})

app.listen(process.env.PORT || 4000, () => {
	console.log("Sever is listening on port 4000")
})

