const express=require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app=express();
const server=require('http').createServer(app);
const io=require('socket.io')(server,{cors:{origin:'*'}});
const port =3001;

app.use(
    cors({
        origin:['https://video-chat-tt41.vercel.app/'],
        methods:["GET","POST"],
        Credentials:true,
    })
)
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
let users = {};

io.on('connection', (socket) => {
    // console.log("user connected with this id:", socket.id);

    socket.on('joined_users', (data) => {
        // console.log(data.id);
        
        socket.join(data.id);
        // Store user information in the users object using socket.id as the key
        users[socket.id] = { id: data.id};

        // socket.join(data.roomName);
        socket.emit('user_connected', data);
    });
    socket.on('CallingUser',(data)=>{

        // console.log(data);
        socket.to(data.userId).emit('SomeoneIsCalling',data.myId);
    })
    socket.on('End_call',(data)=>{
        socket.to(data).emit('End_call');
    })
    socket.on('message',(data)=>{
        // console.log(data);
        socket.to(data.userId).emit('message',data.text);
    })
    socket.on('message1',(data)=>{
        socket.to(data.callingUserId).emit('message1',data.Usertext);
    })
    socket.on('End_call1',(data)=>{
        socket.to(data).emit('End_call1');
    })
    socket.on('accepted',(data)=>{
        // console.log(data);
        socket.to(data).emit('accepted',data);
    })
    socket.on('RejectCalling',data=>{
        
        // console.log(data);
        socket.to(data).emit('RejectCalling',data);
    })
    socket.on('toggle_video',(data)=>{
        // console.log(data);
        socket.to(data.userId).emit('toggle_video',data.showVideo);
    })
    socket.on('toggle_video1',(data)=>{
        // console.log(data);
        socket.to(data.callingUserId).emit('toggle_video1',data.showVideo);
    })
});
server.listen(port,()=>{
    console.log('server is listening on port', `${port}`);
})
