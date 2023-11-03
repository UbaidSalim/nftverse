require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
    },
    matic: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY]
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      // gasPrice: 100000000000,
      accounts: {mnemonic: process.env.mnemonic},
    },
    goerli: {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_PROJECT_ID,
      accounts: {
        mnemonic: process.env.mnemonic,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
    },
  },
  etherscan: {
    apiKey: process.env.API_KEY  // based on network
  },
  solidity: "0.8.9",
};
