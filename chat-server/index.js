const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', (username) => {
    const user = { id: socket.id, username };
    users.push(user);
    io.emit('update-users', users);  
  });

  socket.on('send-message', (message) => {
    io.emit('receive-message', message);  
  });

  socket.on('disconnect', () => {
    users = users.filter((user) => user.id !== socket.id);
    io.emit('update-users', users);  
  });
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
