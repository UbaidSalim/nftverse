
import '../../css/ui-Theme.css';
import '../../css/text.css';
import Home from './Home';
import AfterLogin from './AfterLogin';

function Main() {
    return (
        window.localStorage.getItem("admin_login_success") === "true" ? <AfterLogin/> : <Home/>
    )
}

export default Main;