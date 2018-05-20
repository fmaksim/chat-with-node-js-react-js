"use strict"

const express = require('express');
const app = express();
const server = require('http').createServer(app);
var io = module.exports.io = require('socket.io')(server)

const PORT = process.env.PORT || 3333

const SocketManager = require('./SocketManager')

io.on('connection', SocketManager)


server.listen(PORT, () => {
    console.log("Connected to PORT " + PORT)
});