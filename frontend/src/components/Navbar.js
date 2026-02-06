export default function Navbar(){

 return(
  <div style={{
   padding:15,
   background:"#111",
   color:"white",
   display:"flex",
   justifyContent:"space-between"
  }}>

   <h3>Gig App</h3>

   <div>
    <button onClick={()=>window.location="/dashboard"}>Dashboard</button>
    <button onClick={()=>window.location="/myjobs"}>My Jobs</button>
    <button onClick={()=>window.location="/profile"}>Profile</button>

    <button onClick={()=>{
 localStorage.clear();
 window.location.href="/";
}}>
 Logout
</button>

   </div>

  </div>
 );
}
