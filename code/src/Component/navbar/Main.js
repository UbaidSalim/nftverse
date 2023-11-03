
import '../../css/ui-Theme.css';
import '../../css/text.css';
import BeforeLogin from './BeforeLogin';
import AfterLogin from './AfterLogin';

function Main() {
    return (
        window.localStorage.getItem("login_success") == "true" ? <AfterLogin/> : <BeforeLogin/>
    )
}

export default Main;