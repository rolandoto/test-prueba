const { Server } = require("socket.io");

function configureSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  return io;
}

module.exports = configureSocket;