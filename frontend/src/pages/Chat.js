import {useEffect,useState,useCallback} from "react";
import API from "../api/api";

export default function Chat(){

 const jobId = window.location.pathname.split("/")[2];
 const [msgs,setMsgs]=useState([]);
 const [text,setText]=useState("");
 const token = localStorage.getItem("token");

 const load = useCallback(()=>{
  API.get(`/chat/${jobId}`,{
   headers:{Authorization:`Bearer ${token}`}
  }).then(res=>setMsgs(res.data));
 },[jobId,token]);

 useEffect(()=>{
  load();
 },[load]);

 const send = async()=>{
  await API.post(`/chat/${jobId}`,{text},{
   headers:{Authorization:`Bearer ${token}`}
  });

  setText("");
  load();
 };

 return(
  <div style={{padding:30}}>
   <h2>Chat</h2>

   <div style={{height:300,overflow:"auto",border:"1px solid"}}>
    {msgs.map(m=>(
     <div key={m._id}>
      <b>{m.sender.name}:</b> {m.text}
     </div>
    ))}
   </div>

   <input value={text} onChange={e=>setText(e.target.value)}/>
   <button onClick={send}>Send</button>
  </div>
 );
}
