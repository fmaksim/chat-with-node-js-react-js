"use strict"

const io = require('./index').io
const {
    VERIFY_USER,
    USER_CONNECTED,
    USER_DISCONNECTED,
    LOGOUT
} = require('../Events');

const {createUser, createChat, createMessage} = require('../Objects');
let connectedUsers = {};

module.exports = function (socket) {
    console.log('Socket ID:' + socket.id);

    socket.on(VERIFY_USER, (nickname, callback) => {
        if (isUser(connectedUsers, nickname)) {
            callback({isUser: true, user: null});
        } else {
            callback({isUser:false, user: createUser({name: nickname})});
        }
    });

    socket.on(USER_CONNECTED, (user) => {

        connectedUsers = addUser(connectedUsers, user);
        socket.user = user;
        io.emit(USER_CONNECTED, connectedUsers);

    });

    socket.on('disconnect', () => {
        if ('user' in socket) {
            connectedUsers = removeUser(connectedUsers, socket.user.name);
            io.emit(USER_DISCONNECTED, connectedUsers);
        }
    });

    socket.on(LOGOUT, () => {
        connectedUsers = removeUser(connectedUsers, socket.user.name);
        io.emit(USER_DISCONNECTED, connectedUsers);
    });

}

function isUser(userList, username) {
    return username in userList;
}

function addUser(userList, user) {
    let newList = Object.assign({}, userList);
    newList[user.name] = user;

    return newList;
}

function removeUser(userList, username) {
    let newList = Object.assign({}, userList);
    delete newList[username];

    return newList;
}