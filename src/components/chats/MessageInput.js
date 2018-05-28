import React, {Component} from 'react';

export default class MessageInput extends Component {

    constructor(props) {
        super(props);

        this.state = {
            message: "",
            isTyping: false
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }

    componentWillUnmount() {
        this.stopCheckingTyping();
    }

    /*
    *	Handles submitting of form.
    *	@param e {Event} onsubmit event
    */
    handleSubmit(e) {
        e.preventDefault();
        this.sendMessage();
        this.setState({message: ""});
    }

    /*
    *	Send message to add to chat.
    */
    sendMessage() {

        this.props.sendMessage(this.state.message);
        //this.blur();
    }

    sendTyping() {
        this.lastTypingTime = Date.now();
        if (!this.state.isTyping) {
            console.log("Typing ...");
            this.setState({isTyping: true});
            this.props.sendTyping(true);
            this.startCheckingTyping();
        }
    }

    startCheckingTyping() {
        this.typingInterval = setInterval(() => {
            if (Date.now() - this.lastTypingTime > 200) {
                this.setState({isTyping: false});
                this.stopCheckingTyping();
            }
        }, 200);
    }

    stopCheckingTyping() {
        if (this.typingInterval) {
            console.log("Stop Typing ...");
            clearInterval(this.typingInterval);
            this.props.sendTyping(false);
        }
    }

    render() {
        const {message} = this.state;
        return (
            <div className="message-input">
                <form
                    onSubmit={this.handleSubmit}
                    className="message-form">

                    <input
                        id="message"
                        ref={"messageinput"}
                        type="text"
                        className="form-control"
                        value={message}
                        onChange={({target}) => {
                            this.setState({message: target.value});
                        }}
                        onKeyUp={(e) => {
                            e.keyCode !== 13 && this.sendTyping()
                        }}
                        autoComplete={'off'}
                        placeholder="Please, enter your message"
                    />
                    <button
                        disabled={message.length < 1}
                        type="submit"
                        className="send">Отправить
                    </button>
                </form>
            </div>

        );
    }
}