import React, { Component } from 'react';
import io from 'socket.io-client';
import {USER_CONNECTED, USER_DISCONNECTED} from '../Events';

const socketUrl = "http://192.168.1.4:3333/"

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
        const { title } = this.props;
        return (
            <div className="container">
                {title}
            </div>
        );
    }
}