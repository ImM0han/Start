import { useEffect, useState } from "react";
import API from "../api/api";
import "../App.css";

export default function Dashboard(){

 const [jobs,setJobs] = useState([]);
 const role = localStorage.getItem("role");
 const token = localStorage.getItem("token");
const [search,setSearch] = useState("");
const [status,setStatus] = useState("all");
const [category,setCategory]=useState("");


 useEffect(()=>{
  API.get("/jobs").then(res=>setJobs(res.data));
 },[]);

 // Worker applies job
 const apply = async(id)=>{
  await API.post(`/jobs/${id}/apply`,{},{
   headers:{Authorization:`Bearer ${token}`}
  });

  alert("Applied Successfully");
 };
 const complete = async(id)=>{
 await API.post(`/jobs/${id}/complete`,{},{
  headers:{Authorization:`Bearer ${token}`}
 });

 alert("Job Completed");
 window.location.reload();
};


 // Client accepts worker
 const accept = async(jobId,workerId)=>{
  await API.post(`/jobs/${jobId}/accept`,
   {workerId},
   {headers:{Authorization:`Bearer ${token}`}}
  );

  alert("Worker Accepted");
  window.location.reload();
 };

 return(
  <div className="dashboard">

   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <h2>Available Gigs</h2>

    {role==="client" && (
     <button onClick={()=>window.location="/post"}>
      Post Job
     </button>
    )}
    <button onClick={()=>window.location="/myjobs"}>
 My Jobs
</button>
<input
 placeholder="Search jobs..."
 value={search}
 onChange={e=>setSearch(e.target.value)}
/>

<select onChange={e=>setCategory(e.target.value)}>
 <option value="">All Categories</option>
 <option value="coding">Coding</option>
 <option value="design">Design</option>
 <option value="plumbing">Plumbing</option>
</select>
 

<select onChange={e=>setStatus(e.target.value)}>
 <option value="all">All</option>
 <option value="open">Open</option>
 <option value="assigned">Assigned</option>
 <option value="completed">Completed</option>
</select>

   </div>

   <div className="job-grid">

    {jobs
 .filter(j=>j.title.toLowerCase().includes(search.toLowerCase()))
 .filter(j=>status==="all" ? true : j.status===status)
 .filter(j=>category ? j.category===category : true)
 .map(job=>(


     <div className="job-card" key={job._id}>

      <h3>{job.title}</h3>
      <p>{job.description}</p>
      <p>Category: {job.category}</p>
<p>Location: {job.location}</p>
    <button onClick={()=>window.location=`/chat/${job._id}`}>
 Chat
</button>
{job.chatCount>0 && <span style={{color:"red"}}>●</span>}


      <div className="job-footer">
 <span>₹{job.price} | {job.status}</span>

 {role==="worker" && job.status==="open" && (
  <button onClick={()=>apply(job._id)}>Apply</button>
 )}

 {role==="client" && job.status==="assigned" && (
  <button onClick={()=>complete(job._id)}>Complete</button>
 )}
</div>


      {/* Client sees applicants */}
      {role==="client" && job.applicants?.length>0 && (
       <div style={{marginTop:10}}>
        <b>Applicants</b>

        {job.applicants.map(worker=>(
 <div key={worker._id}>
  {worker.name}
              {job.workerId?._id===worker._id && <span> (Assigned)</span>}
          <button
           style={{marginTop:5}}
           onClick={()=>accept(job._id,worker._id)}
              disabled={job.workerId}
          >
           Accept Worker
          </button>
         </div>
        ))}
       </div>
      )}

     </div>
    ))}

   </div>

  </div>
 );
}
