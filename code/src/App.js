import './App.css';
import Main from './component/navbar/Main';
import Admin from './component/admin/Main';
import { BrowserRouter as Router, Route, Routes, NavLink} from "react-router-dom";
import { GlobalProvider } from './context/GlobalState';
function App() {
  return (
    <GlobalProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<Main/>}></Route>
          <Route path="/admin*" element={<Admin/>}></Route>
        </Routes>
      </Router>
    </GlobalProvider>
  );
}

export default App;
