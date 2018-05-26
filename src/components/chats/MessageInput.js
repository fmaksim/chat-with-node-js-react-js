import React, {Component} from 'react';

export default class MessageInput extends Component {

    constructor(props) {
        super(props);

        this.state = {message: "", isTyping: false};
        this.handleSubmit = this.handleSubmit.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
    }

    /*
    *	Handles submitting of form.
    *	@param e {Event} onsubmit event
    */
    handleSubmit(e) {
        e.preventDefault()
        this.sendMessage()
        this.setState({message: ""})
    }

    /*
    *	Send message to add to chat.
    */
    sendMessage() {

        this.props.sendMessage(this.state.message)
        this.blur()
    }

    render() {
        const {message} = this.state
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