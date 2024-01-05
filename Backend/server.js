// const express = require("express")
// const http = require("http")
// const app = express()
// // const server = http.createServer(app)
// const https = require('https');
// const fs = require('fs');
// const cors = require('cors');
// app.use(cors());
// const server = https.createServer({
// 	key: fs.readFileSync('key.pem'),
// 	cert: fs.readFileSync('certificate.pem'),
//   },app);
// const expressWS = require('express-ws');
// const wsInstance = expressWS(app, server);

// const wsServer = wsInstance.getWss();
// const io = require("socket.io")(server, {
// 	cors: {
// 	  origin: [
// 		// "http://localhost:3000",
// 		// "https://172.168.1.86:3000",
// 		// "https://localhost:3000",
// 		// "https://192.168.56.27:3000",
// 		// "https://169.254.106.148:3000",
// 		"https://192.168.124.160:3000"
// 	  ],
// 	  methods: ["GET", "POST"],
// 	},
// 	secure: true,
//   });
//   console.log(io);
// io.on("connection", (socket) => {
	
// 	socket.emit("me", socket.id)

// 	socket.on("disconnect", () => {
// 		socket.broadcast.emit("callEnded")
// 	})

// 	socket.on("callUser", (data) => {
// 		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
// 	})

// 	socket.on("answerCall", (data) => {
// 		io.to(data.to).emit("callAccepted", data.signal)
// 	})
// })

// server.listen(5000, () => console.log("server is running on port 5000"))
// const allowedOrigins = ['https://blockchainscm.netlify.app', 'https://scm-blockchain.netlify.app', 'http://localhost:3001', 'http://localhost:3000'];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
// }));
const express = require("express");
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const expressWS = require('express-ws');

const app = express();
app.use(cors());
const server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('certificate.pem'),
}, app);

const wsInstance = expressWS(app, server);
const wsServer = wsInstance.getWss();

const io = require("socket.io")(server, {
  cors: {
    origin: [
	 "https://172.168.3.31:3000",
	"https://localhost:3000",
	"https://192.168.56.27:3000",
  "https://192.168.1.14:3000",
	"https://169.254.106.148:3000",
  	'http://localhost:3000',
  	'https://192.168.124.160:3000',
	'https://172.168.0.94:3000/',
	'https://10.11.58.155:3000',
  'https://172.168.0.174:3000',
  'https://192.168.2.145:3000',
  'https://172.168.0.174:3000'],
    methods: ["GET", "POST"],
  },
  secure: true,
});

const connectedClients = new Set(); // Use Set to avoid duplicates

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  // Add the socket ID to the Set when a new connection is established
  connectedClients.add(socket.id);

  // Emit the list of connected clients to all clients
  io.emit("updateClients", Array.from(connectedClients));

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");

    // Remove the socket ID when a client disconnects
    connectedClients.delete(socket.id);

    // Emit the updated list of connected clients to all clients
    io.emit("updateClients", Array.from(connectedClients));
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(5000, () => console.log("server is running on port 5000"));
