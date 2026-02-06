import {BrowserRouter,Routes,Route,Navigate,useLocation} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyJobs from "./pages/MyJobs";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Navbar from "./components/Navbar";

function Private({children}){
 const token = localStorage.getItem("token");
 return token ? children : <Navigate to="/" replace />;
}

function AppContent(){

 const location = useLocation();

 return(
  <>
   {location.pathname !== "/" && location.pathname !== "/register" && <Navbar/>}

   <Routes>
    <Route path="/" element={<Login/>}/>
    <Route path="/register" element={<Register/>}/>

    <Route path="/dashboard" element={<Private><Dashboard/></Private>}/>
    <Route path="/myjobs" element={<Private><MyJobs/></Private>}/>
    <Route path="/profile" element={<Private><Profile/></Private>}/>
    <Route path="/chat/:jobId" element={<Private><Chat/></Private>}/>
   </Routes>
  </>
 );
}

export default function App(){
 return(
  <BrowserRouter>
   <AppContent/>
  </BrowserRouter>
 );
}
