import React, {Component} from 'react';
import PropTypes from 'prop-types'

import SideBar from './Sidebar'

import {User} from '../../Objects'
import Messages from '../chats/Messages'
import MessageInput from '../chats/MessageInput'
import ChatHeading from './ChatHeading'

export default class ChatContainer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            activeChat: null,
            communityChat: null,
            chats: [],
        };
    }

    componentDidMount() {
        const {socket} = this.props
        this.initSocket()
    }

    componentWillUnmount() {
        this.deinitialize()
    }

    /*
    *	Initializes the socket.
    */
    initSocket() {
        const {socket} = this.props
        socket.on('connect', () => {
        })
    }

    render() {
        const {user} = this.props
        const {activeChat, chats} = this.state
        return (
            <div className="container">
                <SideBar
                    chats={chats}
                    user={user}
                    activeChat={activeChat}
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
                                    />

                                    <MessageInput/>
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