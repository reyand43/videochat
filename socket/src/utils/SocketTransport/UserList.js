class UserList {
    constructor() {
        this.userList = [];
    }
    addUser({ name, socketId }) {
        this.userList.push(({
            name,
            socketId,
        }))
    }
    removeUser({ socketId }) {
        this.userList = this.userList.filter((u) => u.socketId !== socketId)
    }
    get users() {
        return this.userList;
    }
    addEndpoint({ endpoint, socketId }) {
        this.userList = this.userList.map((user) => {
            if (user.socketId === socketId) {
                return {
                    ...user,
                    endpoint,
                }
            }
            return user
        })
    }
}

module.exports = UserList;