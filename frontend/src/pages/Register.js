import { useState } from "react";
import API from "../api/api";

export default function Register(){
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [role,setRole]=useState("worker");

 const submit=async()=>{
  await API.post("/auth/register",{name,email,password,role});
  alert("Registered");
 };

 return(
  <div style={{padding:40}}>
   <h2>Register</h2>

   <input placeholder="Name" onChange={e=>setName(e.target.value)}/><br/>
   <input placeholder="Email" onChange={e=>setEmail(e.target.value)}/><br/>
   <input placeholder="Password" type="password" onChange={e=>setPassword(e.target.value)}/><br/>

   <select onChange={e=>setRole(e.target.value)}>
    <option value="worker">Worker</option>
    <option value="client">Client</option>
   </select>

   <br/>
   <button onClick={submit}>Register</button>
   <br/><br/>
<p>
 Already have account?{" "}
 <span
  style={{color:"blue",cursor:"pointer"}}
  onClick={()=>window.location="/"}
 >
  Login here
 </span>
</p>

  </div>
 );
}
