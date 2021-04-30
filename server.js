// server.js
const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

// fake DB
const messages = {
  chat1: [],
  chat2: [],
};

// socket.io server
io.on("connection", (socket) => {
  socket.on("join", function (data) {
    socket.join(data.roomId);
    socket.room = data.roomId;

    const sockets = io.of("/").in().adapter.rooms.get(data.roomId);
    if (sockets?.size === 1) {
      socket.emit("init");
    } else {
      if (sockets?.size === 2) {
        io.to(data.roomId).emit("ready");
      } else {
        socket.room = null;
        socket.leave(data.roomId);
        socket.emit("full");
      }
    }
  });

  socket.on("signal", (data) => {
    console.log("signal");
    io.to(data.room).emit("desc", data.desc);
  });
  socket.on("disconnect", () => {
    const roomId = Object.keys(socket.adapter.rooms)[0];
    if (socket.room) {
      io.to(socket.room).emit("disconnected");
    }
  });
});

nextApp.prepare().then(() => {
  app.get("/messages/:chat", (req, res) => {
    res.json(messages[req.params.chat]);
  });

  app.get("*", (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
