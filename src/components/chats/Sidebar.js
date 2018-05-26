import React, {Component} from 'react';
import FASearch from 'react-icons/lib/fa/search'

export default class SideBar extends Component {
    render() {
        const {chats, activeChat, user} = this.props
        return (
            <div id="side-bar">
                <div className="heading">
                    <div className="app-name">Your chats</div>
                </div>
                <div className="search">
                    <i className="search-icon"><FASearch/></i>
                    <input placeholder="Search" type="text"/>
                    <div className="plus"></div>
                </div>
                <div
                    className="users"
                    onClick={(e) => {
                        (e.target === this.refs.user) && setActiveChat(null)
                    }}>
                    {console.log(chats)}
                    {
                        chats.map((chat) => {
                            if (chat.name) {
                                const lastMessage = chat.messages[chat.messages.length - 1];
                                const classNames = (activeChat && activeChat.id === chat.id) ? 'active' : ''
                                return (
                                    <div
                                        key={chat.id}
                                        className={`user ${classNames}`}
                                        onClick={() => {
                                            setActiveChat(chat)
                                        }}
                                    >
                                        <div className="user-photo">{chat.name[0].toUpperCase()}</div>
                                        <div className="user-info">
                                            <div className="name">{chat.name}</div>
                                            {lastMessage && <div className="last-message">{lastMessage.message}</div>}
                                        </div>

                                    </div>
                                )
                            }

                            return null
                        })
                    }

                </div>
                <div className="current-user">
                    <span>{user.name}</span>
                </div>
            </div>
        );
    }
}