import React, {Component} from 'react';
import PropTypes from 'prop-types';
import SideBar from './Sidebar';
import {User} from '../../Objects';
import Messages from '../chats/Messages';
import MessageInput from '../chats/MessageInput';
import ChatHeading from './ChatHeading';
import {MESSAGE_SENT, DEFAULT_CHAT, MESSAGE_RECIEVED, TYPING} from '../../Events';

export default class ChatContainer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            activeChat: null,
            defaultChat: null,
            chats: [],
        };
    }
    updateChatList = (chat) => {
        this.addChat(chat, true);
    }

    setActiveChat = (activeChat) => {
        this.setState({activeChat});
    }
    addChat = (chat, reset) => {
        const {socket} = this.props;
        const {chats} = this.state;

        const newChatsList = reset === true ? [chat] : [...chats, chat];
        this.setState({chats: newChatsList, activeChat: chat});

        const newMessageEvent = `${MESSAGE_RECIEVED}-${chat.id}`;
        socket.on(newMessageEvent, this.addMessageToChat(chat.id));

        const typingEvent = `${TYPING}-${chat.id}`;
        socket.on(typingEvent, this.updateTypingUser(chat.id));

    }

    sendMessage = (chatId, message) => {
        const {socket} = this.props;
        socket.emit(MESSAGE_SENT, chatId, message);
    }

    addMessageToChat = (chatId) => {
        return message => {
            const {chats} = this.state;
            let newChatsList = chats.map(
                (chat) => {
                    if (chat.id === chatId)
                        chat.messages.push(message);

                    return chat;
                }
            );
            this.setState({chats: newChatsList});
        }
    }

    updateTypingUser = (chatId) => {
        return ({isTyping, user}) => {
            if (user !== this.props.user.name) {
                const {chats} = this.state;
                let newChatsList = chats.map((chat) => {
                    if (chatId === chat.id) {
                        if (isTyping && !chat.typingUsers.includes(user)) {
                            chat.typingUsers.push(user);
                        } else if (!isTyping && chat.typingUsers.includes(user)) {
                            chat.typingUsers = chat.typingUsers.filter((u) => {
                                u !== user
                            });
                        }
                    }
                    return chat;
                });
                this.setState({chats: newChatsList});
            }
        }
    }

    sendTyping = (chatId, isTyping) => {
        const {socket} = this.props;
        socket.emit(TYPING, chatId, isTyping);
    }

    componentWillUnmount() {
        //this.deinitialize()
    }

    componentDidMount() {
        const {socket} = this.props
        this.initSocket();
        socket.emit(DEFAULT_CHAT, this.updateChatList);
    }

    /*
    *	Initializes the socket.
    */
    initSocket() {
        const {socket} = this.props;
        socket.on('connect', () => {
        })
    }

    render() {
        const {user, logout} = this.props
        const {activeChat, chats} = this.state;
        return (
            <div className="container">
                <SideBar
                    chats={chats}
                    user={user}
                    logout={logout}
                    activeChat={activeChat}
                    setActiveChat={this.setActiveChat}
                />

                <div className="chat-room-container">
                    {
                        activeChat !== null ? (
                                <div className="chat-room">
                                    <ChatHeading
                                        name={activeChat.name}
                                        online={true}/>
                                    <Messages
                                        messages={activeChat.messages}
                                        user={user}
                                        typingUsers={activeChat.typingUsers}
                                    />

                                    <MessageInput
                                        sendMessage={(message) => {
                                            this.sendMessage(activeChat.id, message);
                                        }}

                                        sendTyping={(isTyping) => {
                                            this.sendTyping(activeChat.id, isTyping);
                                        }}
                                    />
                                </div>
                            )
                            :
                            <div className="chat-room choose">
                                <h3>Choose chatroom</h3>
                            </div>
                    }
                </div>
            </div>
        );
    }
}

ChatContainer.propTypes = {
    socket: PropTypes.object,
    user: PropTypes.shape(User).isRequired
}