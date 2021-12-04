// const userList = require("../..");
const ROOM_TOKEN = require("../../const/ROOM_TOKEN");
const {
  USER_CONNECTION_SUCCESSED,
  USER_CONNECTION_FAILED,
  USER_NAME_ACCEPTED,
  USER_JOINED,
  MESSAGE_RECEIVED,
  ANSWER,
} = require("../../const/SOCKET_EVENTS");
const randomString = require("../string/randomString");
const EmptySocketTransport = require("./EmptySocketTransport");
const kurento = require("../../config/kurento");
const {publish, view, onCandidate, userRemoved} = require("../../videoChat/usecases")

class SocketTransport extends EmptySocketTransport {
  /**
   * @param {Object} io
   * @param {Object} socket
   * @param {SocketRouter[]} routes
   * @param {String} lessonToken
   */
  constructor({ io, socket, routes, users, messages, pipeline }) {
    super({ io, users, messages });

    this.onDisconnect = this.onDisconnect.bind(this);
    kurento.getKurentoConnection().then((client) => {
      client.on('disconnected', () => console.log('videoChat:kurentoConnection'));
      client.on('reconnected', () => console.log('videoChat:kurentoConnection'));
    })
    this.roomToken = ROOM_TOKEN;
    this.io = io;
    this.users = users;
    this.messages = messages;
    this.socket = socket;
    this.id = socket.id;
    this.init({ routes });
    this.userList;
    this.pipeline = pipeline;
  }

  async init({ routes }) {
    await this.connect();
    routes.map((route) => route.addSocket(this));

    this.addRoute("disconnect", this.onDisconnect);
  }

  addRoute(event, handler) {
    this.socket.on(event, handler);
  }

  joinRoom(room) {
    this.socket.join(room);
  }

  leaveRoom(room) {
    this.socket.leave(room);
  }

  addInfo(key, value) {
    this.socket.client[key] = value;
  }

  getInfo(key) {
    return this.socket.client[key];
  }

  removeInfo(key) {
    delete this.socket.client[key];
  }

  /**
   * @param {String} event
   * @param {Object} [data]
   */
  send(event, data) {
    this.socket.emit(event, data);
  }

  /**
   * @param {String} event
   * @param {Object} [data]
   */
  sendToOthers(event, data) {
    this.socket.broadcast.emit(event, data);
  }

  /**
   * @param {String} room
   * @param {String} event
   * @param {Object} [data]
   */
  sendToOthersInRoom(room, event, data) {
    this.socket.to(room).emit(event, data);
  }

  /**
   * @param {String} room
   * @param {String} event
   * @param {Object} [data]
   */
  sendToAllInRoom(room, event, data) {
    this.io.sockets.to(room).emit(event, data);
  }

  /**
   * @param {String} socketId
   * @param {String} event
   * @param {Object} [data]
   */
  sendToSocketId(socketId, event, data) {
    console.log("SEND SOCKET", event, "To", socketId);
    this.io.to(socketId).emit(event, data);
  }

  getRooms() {
    return this.socket.rooms;
  }

  getRoomInfo(room = "room123") {
    const sids = this.io.sockets.adapter.rooms.get(room);
    if (sids === undefined) return [];
    return [...sids.values()];
  }

  isInRoom(room) {
    const rooms = this.getRooms();
    return Object.keys(rooms).includes(room);
  }

  async connect() {
    if (this.getRoomInfo().length > 3) {
      this.sendToSocketId(this.socket.id, USER_CONNECTION_FAILED, {});
      return;
    }
    this.subscribeToRoom();
    this.sendRoomInfo();
    if (this.getRoomInfo().length > 1) {
      this.sendToOthersInRoom(this.roomToken, "online");
    }
    this.sendToSocketId(this.socket.id, USER_CONNECTION_SUCCESSED, {});
    return {};
  }

  sendRoomInfo() {
    this.sendToAllInRoom(this.roomToken, "room_info", {
      sidsCount: this.getRoomInfo().length,
    });
  }

  subscribeToRoom() {
    this.joinRoom(this.roomToken);
  }

  unSubscribeFromRoom() {
    this.leaveRoom(this.roomToken);
  }

  async addUsername(name) {
    this.socket.data.name = name;
    await this.users.addUser({ name, socketId: this.socket.id });
    this.sendToSocketId(this.socket.id, USER_NAME_ACCEPTED, {
      me: {
        name,
        socketId: this.socket.id,
      },
      messages: this.messages.messages,
    });
    this.sendToAllInRoom(this.roomToken, USER_JOINED, this.users.users);
  }

  async addMessage(message) {
    const username = this.users.users.find(
      (u) => u.socketId === this.socket.id
    )?.name;
    const messageInfo = {
      text: message,
      senderSocketId: this.socket.id,
      senderName: username,
      timestamp: Date.now(),
      id: randomString(),
    };
    this.messages.addMessage(messageInfo);
    this.sendToAllInRoom(this.roomToken, MESSAGE_RECEIVED, messageInfo);
  }

  async initKurentoConnection({offer, type, socketId}) {
    console.log("GOT OFFER ON", type)
    if (type === 'publish') {
      const answer = await publish({
        pipeline: this.pipeline,
        offer,
        users:
        this.users,
        socketId: this.socket.id,
        mySocketId: this.socket.id,
        socket: this.socket
      })
      this.sendToSocketId(this.socket.id, ANSWER, { answer });
      this.sendToAllInRoom(this.roomToken, USER_JOINED, this.users.users);
    } else {
      const answer = await view({
        pipeline: this.pipeline,
        offer,
        users: this.users,
        socketId,
        mySocketId:
        this.socket.id,
        socket: this.socket,
      })
      this.sendToSocketId(this.socket.id, ANSWER, { answer, socketId: socketId});
    }
  }

  async addCandidate({ candidate, socketId }) {
    await onCandidate({candidate, socketId, mySocketId: this.socket.id})
  }

  async onDisconnect() {
    userRemoved({ socketId: this.socket.id })
    this.users.removeUser({ socketId: this.socket.id });
    this.sendToAllInRoom(this.roomToken, USER_JOINED, this.users.users);
    this.sendRoomInfo();
    this.sendToOthersInRoom(this.roomToken, "user_offline");
    this.unSubscribeFromRoom();
    console.log(`DISCONNECTED ${this.id}`);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

module.exports = SocketTransport;
