"use strict"

const io = require('./index').io
const {
    VERIFY_USER,
    USER_CONNECTED,
    USER_DISCONNECTED,
    LOGOUT,
    MESSAGE_SENT,
    MESSAGE_RECIEVED,
    DEFAULT_CHAT,
    TYPING
} = require('../Events');

const {createUser, createChat, createMessage} = require('../Objects');
let connectedUsers = {};
let defaultChat = createChat();

module.exports = function (socket) {
    console.log('Socket ID:' + socket.id);

    let sendMessageToChat;
    let sendTypingToChat;

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
        sendMessageToChat = sendMessageToChatMembers(user.name);
        sendTypingToChat = sendTypingToChatMembers(user.name);

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

    socket.on(MESSAGE_SENT, (chatId, message) => {
        sendMessageToChat(chatId, message);
    });

    socket.on(DEFAULT_CHAT, (callback) => {
        callback(defaultChat);
    });

    socket.on(TYPING, (chatId, isTyping) => {
        sendTypingToChat(chatId, isTyping);
    });

}

function sendTypingToChatMembers(user) {
    return (chatId, isTyping) => {
        io.emit(`${TYPING}-${chatId}`, {user, isTyping});
    }
}

function sendMessageToChatMembers(sender) {
    return (chatId, message) => {
        io.emit(`${MESSAGE_RECIEVED}-${chatId}`, createMessage({message, sender}));
    };
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