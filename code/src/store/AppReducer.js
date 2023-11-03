export default (state, action) => {
    switch(action.type) {
          
      case 'SETUP_WEB3':
        return {
          ...state,
          web3: action.payload,
          web3LoadingErrorMessage: "",
          web3Loadded: true
        }

      case 'SETUP_CONTRACT':
        return {
          ...state,
          contract: action.payload
        }
  
      case 'ADD_ETHEREUM_ACCOUNTS':
        return {
          ...state,
          accounts: action.payload
        }

        case 'ADD_NETWORK':
          return {
            ...state,
            network: action.payload
          }  

      case 'WEB3_LOADING_ERROR':
        return {
          ...state,
          web3LoadingErrorMessage: action.errorMessage,
          web3Loadded: false
        }
      
      case 'SETUP_MINT_FEE':
        return {
          ...state,
          mintFee: action.payload
        }

      case 'NFTVERSE_WALLET':
        return {
          ...state,
          nftverse_wallet: action.payload
        }  
  
      case 'USER_DATA':
        return {
          ...state,
          user_data: action.payload
        }
        
      
      // Lottery
      
      case 'SETUP_LOTTERY_CONTRACT':
        return {
          ...state,
          lottery_contract: action.payload
        }  

       // Staking
      
       case 'SETUP_STAKING_CONTRACT':
        return {
          ...state,
          staking_contract: action.payload
        }    
  
      default:
        return state;
    }
}