/**
 * Created by maksim on 16.05.2016.
 */
var WebSocketServer = require('websocket').server;
var http = require('http');

var mysql = require('mysql');
var dbcon;
var db_config = {
    host: 'localhost',
    user: 'yesno',
    password: 'start123',
    database: 'yesno',
    charset: 'utf8mb4'
};

function handleDisconnect() {
    dbcon = mysql.createConnection(db_config); // Recreate the connection, since
    // the old one cannot be reused.

    dbcon.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    dbcon.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

var clients = [];

var activeClients = [];

var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(1122, function () {
    console.log((new Date()) + ' Server is listening on port 1122');
    handleDisconnect();
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function inArray(array, object) {

    return (array.indexOf(object) != -1);

}

function unique(arr) {
    var obj = {};

    for (var i = 0; i < arr.length; i++) {
        var str = arr[i];
        obj[str] = true; // запомнить строку в виде свойства объекта
    }

    return Object.keys(obj); // или собрать ключи перебором для IE8-
}

var removeByAttr = function (arr, attr, value) {
    var i = arr.length;
    while (i--) {
        if (arr[i]
            && arr[i].hasOwnProperty(attr)
            && (arguments.length > 2 && arr[i][attr] === value )) {

            arr.splice(i, 1);

        }
    }
    return arr;
}

function simpleStringify(object) {
    var simpleObject = {};
    for (var prop in object) {
        if (!object.hasOwnProperty(prop)) {
            continue;
        }
        if (typeof(object[prop]) == 'object') {
            continue;
        }
        if (typeof(object[prop]) == 'function') {
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
}

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}


wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept(null, request.origin);
    var index = clients.push(connection) - 1;

    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function (message) {
        var message_id = 0;
        var clientsArray = [];
        // console.log(connection);
        if (message.type === 'utf8') {

            var messageText = message.utf8Data;
            //console.log("new message ----- " + messageText + '-------;');

            if (messageText.indexOf('user_id=') > -1) {

                var userIdArray = messageText.split("=");
                connection.user_id = userIdArray[1];

                for (var n = 0; n < clients.length; n++) {

                    // console.log(clients[n].user_id + '--current client--;');

                }

            } else if (messageText == 'iOS ping') {

            } else {

                var messageObject = JSON.parse(messageText);
                console.log(messageObject + "-----");

                if (messageObject['status']) {

                    if (messageObject['status'] == 'got') {

                        messageObject = null;
                        return false;

                    }

                    if (messageObject['status'] == 'seen') {

                        dbcon.query(
                            'DELETE FROM chats_unread_messages Where chat_id = ? and user_id = ? LIMIT 1',
                            [messageObject['chat_id'], messageObject['user_id']],
                            function (err, result) {
                                if (err) throw err;

                            }
                        );

                        console.log('seeen');

                        //messageObject.length = 0;
                        messageObject = null;
                        return false;

                    }

                }

            }

            //проверка наличия игрока с таким user_id
            if (!(inArray(clientsArray, connection.user_id))) {
                clientsArray.push(connection.user_id);
            }

            if (messageObject) {

                var members = messageObject['members'].split(",");

                console.log(members + '---player_ids');

                for (var k = 0; k < members.length; k++) {

                    if (!(inArray(clientsArray, members[k]))) {
                        clientsArray.push(members[k]);
                    }

                }

                clientsArray = unique(clientsArray);

                var base64Message = new Buffer(messageObject['message']).toString('base64');

                var messageArray = {
                    added: Math.round(new Date().getTime() / 1000),
                    chat_id: messageObject['chat_id'],
                    message: base64Message,
                    phone: messageObject['phone'],
                    user_name: messageObject['user_name']
                };

                var photoUrl = '';

                if (messageObject['photo_id']) {
                    messageArray['photo_id'] = messageObject['photo_id'];

                    dbcon.query("SELECT photo FROM chat_messages_stickers WHERE id = ?", [messageArray['photo_id']], function (err, result) {
                        if (err) throw err;

                        console.log("selected photo---------");

                        if (result[0].sticker)
                            photoUrl = result[0].sticker;

                    });
                }

                console.log("PHOTO --- " + photoUrl);
                var pushQuery = {
                    added: Math.round(new Date().getTime() / 1000),
                    chat_id: messageObject['chat_id'],
                    phone: messageObject['phone'],
                    message: base64Message,
                    user_name: messageObject['user_name']
                };

                dbcon.query('INSERT INTO chats_push_queries SET ?', pushQuery, function (err, res) {
                    if (err) throw err;

                });

                for (var k = 0; k < members.length; k++) {

                    if (messageObject['user_id'] != members[k]) {

                        var unreadMessageEntry = {
                            added: Math.round(new Date().getTime() / 1000),
                            chat_id: messageObject['chat_id'],
                            user_id: members[k]
                        };

                        dbcon.query('INSERT INTO chats_unread_messages SET ?', unreadMessageEntry, function (err, res) {
                            if (err) throw err;

                            //console.log('Last insert Unread Query ID:', res.insertId);

                        });
                    }

                }

                dbcon.query(
                    'UPDATE chats SET lastmessage_time = ?, lastmessage_text = ? Where id = ?',
                    [messageArray['added'], base64Message, messageObject['chat_id']],
                    function (err, result) {
                        if (err) throw err;

                        //console.log('Changed ' + result.changedRows + ' rows');
                    }
                );

                /*var PHPFPM = require('node-phpfpm');

                var phpfpm = new PHPFPM(
                    {
                        host: '127.0.0.1',
                        port: 9000,
                        documentRoot: __dirname
                    });

                phpfpm.run('/home/www/friendspo.com/send_chat_push.php', function (err, output, phpErrors) {
                    if (err == 99) console.error('PHPFPM server error');
                    console.log(output);
                    if (phpErrors) console.error(phpErrors);
                });*/

                messageText = messageObject['message'];

                //dbcon.end();

            }
            // console.log(clients.length + "---clients length---");

            var usedUserIdsForPing = [];
            var usedUserIdsForMessages = [];


            if (messageObject) {

                dbcon.query('INSERT INTO chats_messages SET ?', messageArray, function (err, res) {
                    if (err) throw err;

                    console.log('Last insert ID:', res.insertId);
                    //var messageId = res.insertId;
                    //messageObject['message_id'] = res.insertId;
                    message_id = res.insertId;
                    console.log(message_id + ' inert message');

                    for (var i = 0; i < clientsArray.length; i++) {

                        for (var k = 0; k < clients.length; k++) {

                            if (clients[k].user_id !== undefined) {

                                //console.log('send message ' + messageText + ' id mes ' + message_id);
                                console.log(clientsArray[i] + '---' + clients[k].user_id + ';;;');
                                if (clients[k].user_id == clientsArray[i] && !(inArray(usedUserIdsForMessages, clients[k].user_id))) {

                                    var outputArray = {
                                        signal_type: 'chat_new_message',
                                        user_id: messageArray['user_id'],
                                        message_id: message_id,
                                        date: messageArray['added'],
                                        chat_id: messageObject['chat_id'],
                                        message: messageObject['message'],
                                        photo: photoUrl ? "http://yes-no.hata.sale/uploads/stickers/" + photoUrl : null
                                    };

                                    console.log(outputArray);
                                    usedUserIdsForMessages.push(clients[k].user_id);

                                    var jsonOutput = JSON.stringify(outputArray);

                                    clients[k].sendUTF(jsonOutput);
                                    console.log('Private to: ' + clients[k].user_id + ' message ' + messageText);

                                }

                            }
                        }

                    }

                });

                //dbcon.end();

            } else {

                for (var i = 0; i < clientsArray.length; i++) {

                    for (var k = 0; k < clients.length; k++) {

                        if (clients[k].user_id !== undefined) {

                            if (clients[k].user_id == clientsArray[i] && !(inArray(usedUserIdsForPing, clients[k].user_id))) {

                                usedUserIdsForPing.push(clients[k].user_id);

                                clients[k].sendUTF(messageText);
                                //console.log('Private to: ' + clients[k].user_id + ' message ' + messageText);
                            }

                        }
                    }

                }

                //dbcon.end();

            }

        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        console.log(connection.user_id + ' disconnected index - ');
        removeByAttr(clients, 'user_id', connection.user_id);

    });
});
