import React, { useEffect,createContext, useReducer, useContext } from 'react';
import AppReducer from '../store/AppReducer';

import { loadBlockchain } from '../store/asyncActions';
// Initial state
const initialState = {
  web3: null,
  network: 0,
  accounts: [],
  web3LoadingErrorMessage:"",
  web3Loadded: false,
  contract: null,
  mintFee: 0,
  nftverse_wallet: "",
  user_data: {},

  //Lottery
  lottery_contract: null,

  //Staking
  staking_contract: null
}

// Create context
export const GlobalContext = createContext(initialState);

// Provider component
export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppReducer, initialState);
    useEffect(()=> {
        loadBlockchain(dispatch);
    },[])    
    

    return (<GlobalContext.Provider value={[state,dispatch]}>
                {children}
            </GlobalContext.Provider>);
}

export const useStore = () => useContext(GlobalContext);