

export const setupWeb3 = (web3) => {
    return {
        type: 'SETUP_WEB3',
        payload: web3
    };
}

export const setupContract = (contract) => {
    return {
        type: 'SETUP_CONTRACT',
        payload: contract
    };
}

export const addNetwork = (network) => {
    return {
        type: 'ADD_NETWORK',
        payload: network
    };
}

export const addEthereumAccounts = (accounts) => {
    return {
        type: 'ADD_ETHEREUM_ACCOUNTS',
        payload: accounts
    };
}

export const web3LoadingError = (errorMessage) => {
    return {
        type: 'WEB3_LOADING_ERROR',
        errorMessage: errorMessage
    };
}

export const setupMintFee = (data) => {
    return {
        type: 'SETUP_MINT_FEE',
        payload: data
    };
}

export const setupNftverseWallet = (data) => {
    return {
        type: 'NFTVERSE_WALLET',
        payload: data
    };
}

export const userData = (data) => {
    return {
        type: 'USER_DATA',
        payload: data
    };
}

// Lottery //

export const setupLotteryContract = (contract) => {
    return {
        type: 'SETUP_LOTTERY_CONTRACT',
        payload: contract
    };
}

// Staking //

export const setupStakingContract = (contract) => {
    return {
        type: 'SETUP_STAKING_CONTRACT',
        payload: contract
    };
}

