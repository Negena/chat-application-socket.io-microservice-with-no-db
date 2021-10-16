const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const formatMessage = require("./utils/messages");
const {userJoin, getCurrentUser, userLeave, getRoomUsers, getUser } = require("./utils/users");


const app = express();
const server = http.createServer(app);
const io = socketio(server);


app.use(express.static(path.join(__dirname, "public")));
const botName = 'botAdmin';

io.on('connection', socket => {
   socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

       socket.emit("message", formatMessage(botName, "welcome"));

       socket.broadcast
       .to(user.room)
       .emit("message",
     formatMessage(botName,`${user.username} joined the chat`)
    );

    io.to(user.room).to(user.username).emit('roomUsers',{
      room: user.room,
      users: getRoomUsers(user.room),
      username: getUser(user.username)
    });
  });

  socket.on('chatMessage', (msg)=> {
    //console.log(msg)
    const user = getCurrentUser(socket.id);

    io.to(user.room)
    .emit("message",
   formatMessage(user.username, msg));
  })

  socket.on("disconnect", ()=> {
    const user = userLeave(socket.id);

    if (user){
      io.to(user.room)
      .emit("message", formatMessage(botName,`${user.username} left the chat`)
    );
    io.to(user.room)
    .emit(
    'roomUsers',{
      room: user.room,
      users: getRoomUsers(user.room)
     });
   }
 });
});

server.listen(3000, ()=> {
  console.log("server runnning on 3000...")
});
