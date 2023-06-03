const express = require('express');
const app = express();
const os = require('os')

const path = require('path');
const server = require('http').createServer(app)
const io = require('socket.io')(server);
app.use(express.static(path.join(__dirname+'/public')))

const networkInterfaces = os.networkInterfaces();
const serverIPAddress = Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface.family === 'IPv4' && iface.internal === false).address;


io.on("connection", function(socket){
    socket.on("sender-join", function(data){
        socket.join(data.uid);
    })
    socket.on("reciever-join", function(data){
        socket.join(data.uid);
        socket.in(data.sender_uid).emit("init", data.uid);
    })
    socket.on("file-meta", function(data){
        socket.in(data.uid).emit("fs-meta", data.metadata)
    })
    socket.on("fs-start", function(data){
        socket.in(data.uid).emit("fs-share",{});
    })
    socket.on("file-raw", function(data){
        socket.in(data.uid).emit("fs-share", data.buffer)
    })
})

server.listen(3000,serverIPAddress, ()=>{
    console.log(`http://${serverIPAddress}:3000/`)
})