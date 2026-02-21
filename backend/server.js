require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("Mongo Connected"));

const io = new Server(server,{
 cors:{origin:"*"}
});
// const clientRoutes = require("./routes/clientRoutes");
// app.use("/api/client", clientRoutes);


io.on("connection",(socket)=>{
 console.log("User connected");

 socket.on("joinRoom",(jobId)=>{
   socket.join(jobId);
 });

 socket.on("sendMessage",(data)=>{
   io.to(data.jobId).emit("receiveMessage",data);
 });
});

server.listen(5000,()=>console.log("Server running"));
