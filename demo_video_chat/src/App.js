import './App.css';
import io from 'socket.io-client';
import Peer from 'peerjs';
import ReactScrollToBottom from 'react-scroll-to-bottom';
// import {ReactScrollToBottom} from 'react-scroll-to-bottom';
import {useEffect,useState} from 'react';
import { useRef } from 'react';
import { IoCallOutline } from "react-icons/io5";
import { LuClipboardList } from "react-icons/lu";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const socket=io("https://video-chat-six-brown.vercel.app");


const mypeer=new Peer(undefined,{
   configuration :{
    'iceServers': [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun.services.mozilla.com:3478' },
      // Add more STUN servers if needed
    ]},
  host:"https://video-chat-six-brown.vercel.app",
  port:"3002"
});
function App() {
  
  const Text=useRef();
  const userText=useRef();
  const [myId,setMyId]=useState();
  const [text,SetText]=useState();
  const [Usertext,SetUserText]=useState();
  const [showVideo, setShowVideo] = useState(true);
  const [yess,setYess]=useState(false);
  const [userId,setUserId]=useState();
  const [myShowShare,SetMyShowShare]=useState(false);
  const [userShowShare,SetUserShowShare]=useState(false);
  const [callingUserId,setCallingUserId]=useState();
  const [CallingArea,setCallingArea]=useState(false);
  const [mystream,SetMyStream]=useState();
  const [CallerAudio,setCallerAudio]=useState(false);
  const [AccepterAudio,setAccepterAudio]=useState(true);
  const [accepted, setAccepted] = useState(false); // Track if the call has been accepted
  const [calling, setCalling] = useState(false); 
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [userCallingArea,setUserCallingArea]=useState(false);
  const [screen,SetScreen]=useState();
  // Function to show notification
  const showNotification = () => {
    setNotificationVisible(true);
  };
  
 
  //function by which another user getting notification about someone is calling
  const CallUser = async () => {

    if(yess)
    {
      toast.success('you are already in a call',{
        position:"top-right", 
        autoClose : 3000,
      })
      return;
    }
    if(accepted)
    {
      toast.success('you are already in a call',{
        position:"top-right", 
        autoClose : 3000,
      })
      return;
    }
    setYess(true); 
    socket.emit('CallingUser', { myId, userId });
    setCallingArea(true);
    setCalling(true); // Call has been initiated
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.style.height = "300px";
        video.style.width = "400px";
        
        video.autoplay = true; // Add this line to start playing the video automatically
        video.muted = true;
        video.style.borderRadius='10px';
         // Mute the local video to avoid feedback
        const div = document.getElementById('video');
        div.innerHTML = ''; // Clear existing content
        div.appendChild(video);
        SetMyStream(stream);
        
    } catch (error) {
        console.error("Error accessing user media:", error);
    }
};


  const Reject=async()=>{

    setNotificationVisible(false);
    socket.emit('End_call',callingUserId);
    
  }

  const Accept = async () => {
    
    setNotificationVisible(false);
   // Call has been accepted
    setAccepted(true);
    socket.emit('accepted',callingUserId);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream=>{
    const call = mypeer.call(callingUserId, stream);   
    //this call.on('stream,(remoteStream)) is for callerUser beacause connection is made with mypeer.call(callingUserId,stream);      
          call.on('stream', (remoteStream) => {
                
          const video = document.createElement('video');//video is of callerUser who is calling you
          video.srcObject = remoteStream;
          video.style.height = "300px";
          video.style.width = "400px";
          video.autoplay = true;
          video.muted=false;
          video.style.borderRadius='10px';         
          const div = document.getElementById('user_video');
          div.innerHTML = ''; // Clear existing content
          div.appendChild(video);
    });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.style.height = "300px";
    video.style.width = "400px";
    video.style.borderRadius='10px';
    video.autoplay = true; // Add this line to start playing the video automatically
    video.muted = true; // Mute the local video to avoid feedback
    const div = document.getElementById('video');
    const div3=document.createElement('div');
    div3.id='CallingUser';
    document.body.appendChild(div3);
    const VideoButton=document.getElementById('VideoButton');
    div.innerHTML = ''; // Clear existing content
    const button1=document.createElement('button');
    button1.innerHTML="mute";
    const button2=document.createElement('button');
    const button3=document.createElement('button');
    // const button4=document.createElement('button');
    // const button5=document.createElement('button');
    button3.innerHTML="Start video";
    button2.innerHTML="End Call";
    // userShowShare ?button4.innerHTML='Stop Share':button4.innerHTML='Start Sharing';
    button2.className='btn btn-danger'
    button3.className='btn btn-warning'
    button1.className='btn btn-primary'
    // button4.className='btn btn-primary'
    // button5.className='btn btn-warning'
    VideoButton.appendChild(button3);
    VideoButton.appendChild(button1);
    VideoButton.appendChild(button2);
    // VideoButton.appendChild(button4);
    const userScreen=document.getElementById('userScreen');
    VideoButton.style.display='flex';
    VideoButton.style.justifyContent='center';
    VideoButton.style.gap='10px';
    VideoButton.style.marginTop='2rem';
    VideoButton.style.marginBottom='6rem';
    VideoButton.appendChild(userScreen);
    
    button3.addEventListener('click',()=>{
      ToggleVidoes();
    })
    button2.addEventListener('click',()=>{
       socket.emit('End_call',callingUserId);
       window.location.reload();
    })
    // button4.addEventListener('click',()=>{
    //   userShowShare?StopUserShare():ScreenSharing();
    // })
    div.appendChild(video);
    SetMyStream(stream);
  });
    }else {
      console.error('getUserMedia is not supported on this device');
    }
};
useEffect(()=>{

  const Message=(data)=>{
    const message=document.getElementById('message-container1');
    const div = document.createElement('div');
    const textInput=document.createTextNode(data);
    div.appendChild(textInput);
    message.appendChild(div);
    div.style.backgroundColor='rgb(209, 209, 224)'
    div.style.padding="7px";
    div.style.marginTop='5px';
    div.style.borderRadius='12px';
    div.style.color='black';
    div.style.float='left';
    div.style.clear='both';

  }

  socket.on('message',Message);

  return()=>{
    socket.off('message',Message);
  }
})
useEffect(()=>{

  const Message=(data)=>{
    const message=document.getElementById('message-container');
    const div = document.createElement('div');
    const textInput=document.createTextNode(data);
    div.appendChild(textInput);
    div.style.backgroundColor='rgb(209, 209, 224)'
    div.style.padding="7px";
    div.style.marginTop='5px';
    div.style.borderRadius='12px';
    message.appendChild(div);
    div.style.float='left';
    div.style.clear='both';
    div.style.color='black';

  }

  socket.on('message1',Message);

  return()=>{
    socket.off('message1',Message);
  }
})
const UserSend=()=>{
  socket.emit('message1',{callingUserId,Usertext});
  const message=document.getElementById('message-container1');
  const div = document.createElement('div');
  const textInput=document.createTextNode(Usertext);
  div.appendChild(textInput);
  message.appendChild(div);
  div.style.backgroundColor='rgb(128, 128, 255)'
  div.style.padding="7px";
  div.style.marginTop='5px';
  div.style.borderRadius='12px';
  div.style.float='right';
  div.style.clear='both';
  div.style.color='black';
  userText.current.value="";
}
const Send=()=>{
  socket.emit('message',{userId,text});
  const message=document.getElementById('message-container');
  const div = document.createElement('div');
  const textInput=document.createTextNode(text);
  div.appendChild(textInput);
  div.style.backgroundColor='rgb(128, 128, 255)'
  div.style.padding="7px";
  div.style.marginTop='5px';
  div.style.borderRadius='12px';
  message.appendChild(div);
  div.style.float='right';
  div.style.clear='both';
  Text.current.value=""
  div.style.color='black';
}
useEffect(()=>{

  const Yess=()=>{
    console.log(true);
    setYess(true);
  }
  socket.on('accepted',Yess);
  return()=>
  {
    socket.off('accepted',Yess);
  }
},[]);
useEffect(()=>{
  mypeer.on('call', function(call) {
    try {
      
        console.log("connected");
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream=>{ SetMyStream(stream);
        call.answer(stream)});
  
        call.on('stream', (remoteStream) => {
        const video = document.createElement('video');//this video is of the user who is accepting the call
        video.srcObject = remoteStream;
        video.style.height = "300px";
        video.style.width = "400px";
        video.style.borderRadius='10px';
        video.autoplay = true;
        video.muted = false;
        const div = document.getElementById('user_video');
        div.innerHTML = '';
        div.appendChild(video);
      });}
     catch (error) {
      console.error("Error accessing user media:", error);
     }
    })
  
},[accepted]);  

const EndCall=()=>{
  window.location.reload();
  socket.emit('End_call1',userId);
}

useEffect(()=>{
 
  const End_call1=()=>{

    window.location.reload();
   
  }
  socket.on('End_call1',End_call1);
  return()=>{
    socket.off('End_call1',End_call1); 
  }
},[]);
useEffect(()=>{
 
  const End_call=()=>{

    window.location.reload();
   
  }
  socket.on('End_call',End_call);
  return()=>{
    socket.off('End_call',End_call); 
  }
},[]);




  useEffect(()=>{
    
    const RejectCalling=(data)=>{
      
     alert('call declined')
  
    }
    socket.on('RejectCalling',RejectCalling);

    return()=>{
      socket.off('RejectCalling',RejectCalling);
    }

  },[]);
  useEffect(()=>{
    
    const SomeoneIsCalling=(data)=>{
      
      setCallingUserId(data);
      showNotification();
  
    }
    socket.on('SomeoneIsCalling',SomeoneIsCalling);

    return()=>{
      socket.off('SomeoneIsCalling',SomeoneIsCalling);
    }

  },[]);
  
  useEffect(()=>{

    const OpenPeer=(id)=>{
      socket.emit('joined_users',{id});
    }
    mypeer.on('open',OpenPeer);

    return()=>{
      mypeer.off('open',OpenPeer);
    }
  },[]);
   
  useEffect(()=>{
    
    const UserConnected=(data)=>{
      
      setMyId(data.id);
      const text=document.getElementById('myid');
      text.innerHTML=`<h4>Your Id is: ${data.id}</h4>`;
      console.log(data);
  
    }
    socket.on('user_connected',UserConnected);

    return()=>{
      socket.off('user_connected',UserConnected);
    }

  },[]);
  
  const ToggleVideo = () => {
    let video=document.getElementById('video');
    setShowVideo(!showVideo);
    video.style.display = video.style.display === 'none' ? 'inherit' : 'none';
    socket.emit('toggle_video',{userId,showVideo});
    
  };
  const ToggleVidoes=()=>{

    let video=document.getElementById('video');
    setShowVideo(!showVideo);
    video.style.display = video.style.display === 'none' ? 'inherit' : 'none';
    socket.emit('toggle_video1',{callingUserId,showVideo});
    
  }
  useEffect(()=>{
   
    const Toggle_Video=()=>{
     
      // console.log('sge');
      let video=document.getElementById('user_video');
      video.style.display = video.style.display === 'none' ? 'inherit' : 'none';
    }
    socket.on('toggle_video',Toggle_Video);
    return()=>{
      socket.off('toggle_video',Toggle_Video);
    }
  },[])
  useEffect(()=>{
   
    const Toggle_Video1=()=>{
     
      // console.log('sge');
      let video=document.getElementById('user_video');
      video.style.display = video.style.display === 'none' ? 'inherit' : 'none';
    }
    socket.on('toggle_video1',Toggle_Video1);
    return()=>{
      socket.off('toggle_video1',Toggle_Video1);
    }
  },[])

  const ScreenSharing=async()=>{
    await navigator.mediaDevices.getDisplayMedia({video:true}).then((stream)=>{
      SetUserShowShare(!userShowShare)
      SetScreen(stream);
      mypeer.call(callingUserId,stream);
      const video = document.createElement('video');//this video is of the user who is accepting the call
       video.srcObject = stream;//my screen will reflect to the other user 
       video.style.height = "300px";
       video.style.width = "400px";
       video.autoplay = true;
       video.muted = true;
   
       const div = document.getElementById('my_screen');
       div.innerHTML = '';
       div.appendChild(video);
  })
  mypeer.on('call', function(call) {
   try {
       // navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream=>{ SetMyStream(stream);
       // call.answer(stream)});
       call.on('stream', (remoteStream) => {
       const video = document.createElement('video');//this video is of the user who is accepting the call
       video.srcObject = remoteStream;//my screen will reflect to the other user 
       video.style.height = "300px";
       video.style.width = "400px";
       video.style.border='1px solid white'
       video.autoplay = true;
       video.muted = true;
       
     });}
    catch (error) {
     console.error("Error accessing user media:", error);
    }
   })
  }
  const ScreenShare=async()=>{
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    SetMyShowShare(!myShowShare);
     await navigator.mediaDevices.getDisplayMedia({video:true}).then((stream)=>{
         SetScreen(stream);
         mypeer.call(userId,stream);
         const video = document.createElement('video');//this video is of the user who is accepting the call
          video.srcObject = stream;//my screen will reflect to the other user 
          video.style.height = "300px";
          video.style.border='1px solid white'
          video.style.width = "400px";
          video.autoplay = true;
          video.muted = true;
      
          const div = document.getElementById('my_screen');
          div.innerHTML = '';
          div.appendChild(video);
     })
    }else {
      console.error('getUserMedia is not supported on this device');
    }
     }
       
  const StopUserShare=async()=>{
    SetUserShowShare(!userShowShare)
    let video=document.getElementById('my_screen');
    video.innerHTML='';
    await navigator.mediaDevices.getUserMedia({video:true}).then((stream)=>{
      SetScreen(stream);
      mypeer.call(callingUserId,stream);
    })
  }
  const StopShare=async()=>{
    SetMyShowShare(!myShowShare);
    let video=document.getElementById('my_screen');
    video.innerHTML='';
    await navigator.mediaDevices.getUserMedia({video:true}).then((stream)=>{
      SetScreen(stream);
      mypeer.call(userId,stream);
    })
  }
  const Enter=(e)=>{
    if(e.key==='Enter' && text.trim()!=="")
    {
      Send();
    }
  }
  const Enter1=(e)=>{
    if(e.key==='Enter' && Usertext.trim()!=="")
    {
       UserSend();
    }
  }
  const copyToClipboard=async(e)=>{
    const text=document.getElementById('myid').textContent;
    const textToCopy = text.substring(text.indexOf("Your Id is: ") + "Your Id is: ".length);
    await navigator.clipboard.writeText(textToCopy).then(function(){
      toast.success('Copy to Clipboard',{
        position:"top-right", 
        autoClose : 3000,
      })
    })
  }
  return (
    <div className="App">
      
      {yess && (
        <div ><nav class="navbar navbar-dark bg-dark fixed-top" style={{fontFamily:"cursive"}} >
        <div class="container-fluid">
          <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
            <div class="offcanvas-header">
              <h5 class="offcanvas-title" id="offcanvasDarkNavbarLabel">Your Messages</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body" style={{overflow:"hidden"}} >
              
             
             <ReactScrollToBottom className="message-container" >
             <div id="message-container" style={{height:"31.5rem",fontSize:"1.5rem",marginBottom:"2px"}}></div>
             </ReactScrollToBottom>
             <div style={{display:"flex"}}>
             <input class="form-control me-2" type="search" placeholder="Search" onKeyDown={Enter} ref={Text} aria-label="Search" onChange={(e)=>SetText(e.target.value)} style={{marginTop:"4px"}}/>
             <center><button class="btn btn-success" type="submit" style={{marginTop:"4px"}} onClick={Send}>Send</button></center>
             </div>
            </div>
          </div>
        </div>
      </nav>
      <ToastContainer/></div>
      
      )}
      {accepted && (
      <div ><nav class="navbar navbar-dark bg-dark fixed-top" style={{fontFamily:"cursive"}} >
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
          <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasDarkNavbarLabel">Your Messages</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div class="offcanvas-body" style={{overflow:"hidden"}}>
           <ReactScrollToBottom className="message-container" style={{fontSize:"1.5rem"}}>
           <div id="message-container1" style={{height:"31rem",fontSize:"1.5rem"}}></div>
           </ReactScrollToBottom>
           
           <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" style={{marginTop:"4px"}} onKeyDown={Enter1} ref={userText} onChange={(e)=>SetUserText(e.target.value)}/>
           <center><button class="btn btn-success" type="submit"  onClick={UserSend}>Send</button></center>
          </div>
        </div>
      </div>
    </nav><ToastContainer/></div>
    )}
      <center style={{ fontFamily: "cursive" }}>
      {/* <img src="../images/icon.jpg" alt="" style={{ width: "20%", height: "10%", borderRadius: "50px" }} /> */}
      {!yess && !accepted && (
        <div class="card" style={{width:"25rem",marginTop:"2%"}}>
        <div class="card-body">
       <center> <h1 style={{color: "Black" }}>Welcome To The ZOOM</h1></center>
        <ToastContainer/>
        </div>
        </div>
      
      
      )}
      
      <div id="notification" style={{marginTop:"2rem",marginBottom:"6rem"}}>
      {notificationVisible && (
        <div className='card' style={{width:"18rem"}}>
        <div className='card-body'>
 
            <div style={{marginTop:"2rem",marginBottom:"2rem"}}>
           
              <IoCallOutline className='Calling'/>
             
              
              <h4>Someone is Calling you...</h4>
              <button className="btn btn-primary" id="accept" onClick={Accept} style={{marginRight:"1rem"}} >Accept</button>
              <button className="btn btn-danger" onClick={Reject}>Reject</button>
              <audio autoPlay loop>
              <source src="../audio/cellphone-ringing-6475.mp3"  type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
            </div>
            </div>
       </div>
   
          )}
    
      </div>
      <center>
      <div id='video'></div>
      <div id='user_video'>
      </div>
      </center>
      
      <div id="VideoButton"></div>
      <div id='my_screen'></div>
      {accepted && (
        <button id="userScreen" className='btn btn-primary' onClick={userShowShare?StopUserShare:ScreenSharing}>{userShowShare ?"Stop Share":"Screen Share"}</button>
      )}
      
      {CallingArea && (
      <div id="CallingArea" style={{marginTop:"2rem",marginBottom:"6rem",display:"flex",justifyContent:"center",gap:"10px"}}>
        
        <button className="btn btn-warning" onClick={ToggleVideo}>
        {showVideo ? "Stop Video" : "Start Video"}
      </button>
        <button className="btn btn-primary" >{CallerAudio ? "Unmute" : "Mute"}</button>
        <button className="btn btn-danger" onClick={EndCall}>End Call</button>
        <button className='btn btn-primary'onClick={myShowShare ? StopShare:ScreenShare}>{myShowShare ?"Stop Share":"Screen Share"}</button>
        {/* <button className='btn btn-primary' onClick={StopShare}>Stop share</button>       */}
      </div> )}
      <center>
      <div class="card" style={{width:"25rem",height:"15rem",marginBottom:"5rem"}}>
      <div class="card-body">
        <center style={{marginTop:"5%"}}>
        <div class="card-title" id='myid'></div>
        <LuClipboardList className='CopyToClipBoard' onClick={copyToClipboard}/>
      <input
        className="form-control form-control-lg" type="text" onChange={(e) => setUserId(e.target.value)}
        placeholder="Enter Id of user whom you want to call..."
        aria-label=".form-control-lg example"
        style={{ width: "99%", margin: "5px" }}
        required
      />
      <button className='btn btn-success' id='callUser' style={{width:"30%"}} onClick={CallUser}>Call</button>
      
      </center>
    
        {/* <a href="#" class="btn btn-primary">Go somewhere</a> */}
      </div>
    </div>
    </center>
  
      
      </center>
    </div>
  );
}

export default App;
