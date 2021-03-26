const cuid = require('cuid');
const LobbyService = require('./lobbyservice');

function UserService() {
    this.create = async function(lobbyCode) {
        const lobby = await LobbyService.getLobby(lobbyCode);

        if (lobby == null) {
            throw new Error('Unable to create new user');
        }

        let user = {
            uid: cuid(),
            finished: false
        };

        if (lobby.users == null) {
            lobby.users = [];
        }

        lobby.users.push(user);

        await LobbyService.update(lobby);

        return user;
    }

    this.update = async function(lobby, user) {
        if (user == null) {
            return await this.create(lobbyCode);
        } else {
            try {
                this._updateData(lobby, user);

                await LobbyService.update(lobby);

                return user;
            } catch (error) {
                throw new Error(`Unable to update user: ${error}`);
            }
        }
    }

    this.getUser = async function(lobbyCode, uid) {
        const lobby = await LobbyService.getLobby(lobbyCode);

        if (lobby == null) {
            throw new Error('Unable to retrieve lobby');
        }

        const user = lobby.users.find(usr => usr.uid === uid);

        if (user == null) {
            throw new Error('Unable to find user');
        }

        return user;
    }

    this._updateData = function(lobby, user) {
        const userIndex = lobby.users.findIndex(usr => usr.uid === user.uid);
        if (userIndex == null || userIndex == -1) {
            throw new Error('Unable to find user');
        } else {
            lobby.users[userIndex] = user;
        }
    }
}

module.exports = new UserService();
