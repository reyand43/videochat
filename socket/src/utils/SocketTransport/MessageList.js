class MessageList {
    constructor() {
        this.messageList = new Array;
    }
    addMessage(message) {
        this.messageList.push(message)
    }
    get messages() {
        return this.messageList
    }
}

module.exports = MessageList;