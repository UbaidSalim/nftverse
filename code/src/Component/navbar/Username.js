
import { useStore } from "../../context/GlobalState";

export default function Username(){
    const [{user_data}] = useStore();
   
    return (
        <div>
        {
            JSON.stringify(user_data) !== '{}' ? 
            <div className="text-right" style={{marginRight:"1%", marginTop: "-3%"}}>
                <h5><b>Hello, {user_data.username}!!!</b></h5>
                <b>Wallet: {user_data.wallet_address.slice(0,5)}...........{user_data.wallet_address.slice(37,42)}</b>
            </div> : null
        }   
        <hr/>     
        </div>
    )
}