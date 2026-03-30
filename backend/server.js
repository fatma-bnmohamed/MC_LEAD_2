const express = require("express");
require("dotenv").config();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const userGroupRoutes = require("./routes/userGroupRoutes");
const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
const leadRoutes = require("./routes/leadRoutes");
const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());

// routes API
app.use(userRoutes);
app.use(userGroupRoutes);
app.use(authRoutes);
app.use("/companies", companyRoutes);
app.use("/leads", leadRoutes);

// créer serveur HTTP
const server = http.createServer(app);

// socket.io
const io = new Server(server,{
  cors:{
    origin:"*",
    methods:["GET","POST"]
  }
});

const users = {}

io.on("connection", (socket) => {

  console.log("User connected")

  socket.on("join", (userId) => {

    users[userId] = socket.id

    console.log("User joined:", userId)

  })

  // envoyer message
  socket.on("send_message", async (data) => {

    const { senderId, receiverId, message } = data

    try {

      // sauvegarder message en base
      await db.query(
        "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1,$2,$3)",
        [senderId, receiverId, message]
      )

      // envoyer message au destinataire
      const receiverSocket = users[receiverId]

      if(receiverSocket){
        io.to(receiverSocket).emit("receive_message", data)
      }

    } catch(err){
      console.error(err)
    }

  })

  socket.on("disconnect", () => {

    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId]
        break
      }
    }

    console.log("User disconnected")

  })

})
// lancer serveur
server.listen(5001, () => {
  console.log("Server running on port 5001");
});

