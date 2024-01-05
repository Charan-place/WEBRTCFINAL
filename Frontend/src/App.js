import React, { useState, useRef, useEffect } from 'react';
// import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
// import TextField from '@mui/material/TextField';
// import AssignmentIcon from '@mui/icons-material/Assignment';
import PhoneIcon from '@mui/icons-material/Phone';
// import { makeStyles } from './@mui/material/styles';
import { makeStyles } from '@material-ui/core/styles';

// Update the Socket.IO connection to use the secure wss protocol
// const socket = io.connect("localhost:5000", { secure: true });
const socket=io.connect("https://192.168.2.145:5000",{secure:true});
const useStyles = makeStyles((theme) => ({
  
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#282c34', // Set your desired background color
    color: '#fff', // Set text color
  },
  videoContainer: {
    display: 'flex',
    justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#808080',
    // marginTop: '20px',
    // border: '2px round #fff',
    borderRadius: '20px',
    margin: '20px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
  },
  video: {
    display: "flex",
    justifyContent: 'center',
    // border: '2px round #fff',
    borderRadius: '20px',
    // borderRadius: '10px',
    margin: '20px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
    transition: 'transform 0.3s ease-in-out', // Add a smooth transition for lively effect
    '&:hover': {
      transform: 'scale(1.05)', // Scale up on hover for a lively effect
    },
    overflow: 'hidden',
  },
  // myId: {
    //  textAlign: "center",
    //  margin: "0px",
  // },
  callButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '20px',
    buttonHover : 'white',
  },
 }));
function App() {
  const classes = useStyles();
  const myVideo = useRef();
  const userVideo = useRef();
  const [me, setMe] = useState("");
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  // const [idToCall, setIdToCall] = useState("");
  const [name, setName] = useState("");
  const connectionRef = useRef();
  const [connectedClients, setConnectedClients] = useState([]);
  const callButtonRef = useRef(null);

  useEffect(() => {
    // io.on('me', (socket) => {
    //   console.log('User connected with ID:', socket.id);
    
    //   // Handle other events as needed...
    
    //   // socket.on('disconnect', () => {
    //   //   console.log('User disconnected:', socket.id);
    //   //   // Handle disconnection...
    //   });
    console.log(socket)
    const getMedia = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(userStream);
        myVideo.current.srcObject = userStream;
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };
    
	socket.on("me", (id) => {
    console.log(socket,socket.id)
		setMe(id)
	})
  socket.on("updateClients", (clients) => {
    setConnectedClients(clients);
    console.log("Connected Clients:", clients);
  });
    getMedia();
		socket.on("me", (id) => {
		  console.log("User connected with ID:", id);
		  socket.emit("me", id);
		});
	  
    socket.on("me", (id) => {
		console.log(id,"ghjkl");
      setMe(id);
      console.log("id:", id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
    // callFirstClient();
    // callFirstClient();
    // if (callButtonRef.current) {
      callButtonRef.current.click();
    // }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on("stream", (remoteStream) => {
      userVideo.current.srcObject = remoteStream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (remoteStream) => {
      userVideo.current.srcObject = remoteStream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };
  const callFirstClient = () => {
    if (connectedClients.length > 1) {
      const firstClient = connectedClients[0];
      callUser(firstClient);
      // answerCall();
    }
    // } else {
      // alert("No connected clients to call.");
    // }
  };

//   return (
//     <div className="row 1">
//       <h1 style={{ textAlign: "center", color: '#fff' }}>WebRTC</h1>
//       <div className="container col">
//         {/* <section> */}
//         <div className="video-container">
//           <div className="video">
//             {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
//           </div>
//           <div className="video">
//             {callAccepted && !callEnded ? (
//               <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} />
//             ) : null}
//           </div>
//         </div>
//         {/* </section> */}
//         <div className="myId col">
//           <TextField
//             id="filled-basic"
//             label="Name"
//             variant="filled"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             style={{ marginBottom: "20px" }}
//           />
//           {/* <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
//             <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
//               Copy ID
//             </Button>
//           </CopyToClipboard> */}

//           {/* <TextField
//             id="filled-basic"
//             label="ID to call"
//             variant="filled"
//             value={idToCall}
//             onChange={(e) => setIdToCall(e.target.value)}
//           /> */}
//           <div className="call-button">
//             {callAccepted && !callEnded ? (
//               <Button variant="contained" color="secondary" onClick={leaveCall}>
//                 End Call
//               </Button>
//             ) : (
//               <IconButton color="primary" aria-label="call" onClick={callFirstClient} ref={callButtonRef}>
//                 <PhoneIcon fontSize="large" />
//               </IconButton>
//             )}
//             {idToCall}
//           </div>
//         </div>
//         <div>
//         {/* <h2>Connected Clients:</h2>
//         <ul>
//           {connectedClients.map((client) => (
//             <li key={client}>{client}</li>
//           ))}
//         </ul> */}
//       </div>
//         <div>
//           {receivingCall && !callAccepted ? (
//             <div className="caller">
//               <h1>{name} is calling...</h1>
//               <Button variant="contained" color="primary" onClick={answerCall}>
//                 Answer
//               </Button>
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// }
return (
  <div className={classes.container}>
    <div className={classes.videoContainer}>
      <div className={classes.video}>
        {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
      </div>
      <div className={classes.video}>
        {callAccepted && !callEnded ? (
          <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} />
        ) : null}
      </div>
    </div>
    <div className={classes.myId}>
      {/* <TextField
        id="filled-basic"
        label="Name"
        variant="filled"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginBottom: "20px" }}
      /> */}
      <div className={classes.callButton}>
        {callAccepted && !callEnded ? (
          <Button variant="contained" color="secondary" onClick={leaveCall}>
            End Call
          </Button>
        ) : (
          <IconButton color="primary" aria-label="call" onClick={callFirstClient} ref={callButtonRef}>
            <PhoneIcon fontSize="large" />
          </IconButton>
        )}
        {/* {idToCall} */}
      </div>
    </div>
    <div>
      {receivingCall && !callAccepted ? (
        <div className="caller">
          <h1>Client is calling...</h1>
          <Button variant="contained" color="primary" onClick={answerCall}>
            Answer
          </Button>
        </div>
      ) : null}
    </div>
  </div>
);
}


export default App;
