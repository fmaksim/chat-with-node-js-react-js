import React, {Component} from 'react';

const Timestamp = require('react-timestamp');

export default class Messages extends Component {

    constructor(props) {
        super(props);
        this.scrollDown = this.scrollDown.bind(this)
    }

    /*
    *	Scrolls down the view of the messages.
    */
    scrollDown() {
        const {container} = this.refs
        container.scrollTop = container.scrollHeight
    }

    componentDidUpdate(newProps) {
        this.scrollDown();

    }

    componentDidMount() {
        this.scrollDown();
    }

    render() {
        const {messages, user, typingUsers} = this.props;
        return (
            <div ref={'container'}
                 className="thread-container">
                <div className="thread">
                    {
                        messages.map((mes, i) => {

                            return (
                                <div key={mes.id}
                                     className={`message-container ${mes.user_phone === user.phone && 'right'}`}>
                                    <div className="time"><Timestamp format="" time={mes.added}/></div>
                                    <div className="data">
                                        <div className="message">{mes.message}</div>
                                        <div className="name">{mes.user_name}</div>
                                    </div>
                                </div>)
                        })

                    }

                </div>
            </div>
        );
    }
}