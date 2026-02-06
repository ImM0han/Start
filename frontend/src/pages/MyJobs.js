import { useEffect, useState } from "react";
import API from "../api/api";

export default function MyJobs(){

 const [jobs,setJobs]=useState([]);
 const token = localStorage.getItem("token");

 useEffect(()=>{
  API.get("/jobs").then(res=>setJobs(res.data));
 },[]);

 const myId = JSON.parse(atob(token.split(".")[1])).id;

 return(
  <div style={{padding:30}}>
   <h2>My Jobs</h2>

   {jobs.filter(j=>j.workerId?._id===myId || j.clientId?._id===myId)
    .map(job=>(
     <div key={job._id} style={{border:"1px solid",margin:10,padding:10}}>
      <h4>{job.title}</h4>
      <p>Status: {job.status}</p>
     </div>
   ))}
  </div>
 );
}
