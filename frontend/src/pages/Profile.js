import {useEffect,useState} from "react";
import API from "../api/api";

export default function Profile(){

 const [user,setUser]=useState({});

 useEffect(()=>{
  API.get("/auth/me").then(res=>setUser(res.data));
 },[]);

 return(
  <div style={{padding:30}}>
   <h2>Profile</h2>

   <p>Name: {user.name}</p>
   <p>Role: {user.role}</p>
   <h3>Balance: ₹{user.balance}</h3>
  </div>
 );
}
