import React, { Component } from 'react';
import io from 'socket.io-client';
import {USER_CONNECTED, USER_DISCONNECTED} from '../Events';
import LoginForm from '../components/LoginForm';
import ChatContainer from '../components/chats/ChatContainer';

const socketUrl = "http://192.168.1.3:3333/";

export default class Layout extends Component {

    constructor(props) {
        super(props);
        this.state = {
            socket: null,
            user: null,
        };
    }

    componentWillMount() {
        this.initSocket();
    }

    initSocket = ()=> {
        const socket = io(socketUrl);
        socket.on('connect', ()=> {
            console.log('Connected!');
        });
        this.setState({socket});
    }

    setUser = (user)=> {
        const {socket} = this.state;
        socket.emit(USER_CONNECTED, user);
        this.setState({user});
    }

    logout = ()=> {
        const {socket} = this.state;
        socket.emit(USER_DISCONNECTED);
        this.state({user: null});
    }

    render() {
        const {socket, user} = this.state;
        return (
            <div className="container">
                {
                    user ?
                        <ChatContainer socket={socket} user={user} logout={this.logout}/>
                        :
                        <LoginForm socket={socket} setUser={this.setUser}/>
                }
            </div>
        );
    }
}