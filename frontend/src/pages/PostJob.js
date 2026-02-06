import { useState } from "react";
import API from "../api/api";

export default function PostJob(){

 const [title,setTitle]=useState("");
 const [description,setDescription]=useState("");
 const [price,setPrice]=useState("");
 const [category,setCategory]=useState("");
const [location,setLocation]=useState("");


 const submit = async()=>{
  const token = localStorage.getItem("token");

  await API.post("/jobs",
   {title,description,price},
   {
    headers:{
     Authorization:`Bearer ${token}`
    }
   }
  );
API.post("/jobs",{title,description,price,category,location},{headers:{Authorization:`Bearer ${token}`}})

  alert("Job Posted");
  window.location="/dashboard";
 };

 return(
  <div style={{padding:40}}>
   <h2>Post Job</h2>

   <input placeholder="Title" onChange={e=>setTitle(e.target.value)}/><br/><br/>
   <input
 placeholder="Category"
 onChange={e=>setCategory(e.target.value)}
/>
<input
 placeholder="Location"
 onChange={e=>setLocation(e.target.value)}
/>

   <textarea placeholder="Description" onChange={e=>setDescription(e.target.value)}/><br/><br/>
   <input placeholder="Price" onChange={e=>setPrice(e.target.value)}/><br/><br/>

   <button onClick={submit}>Post</button>
  </div>
 );
}
