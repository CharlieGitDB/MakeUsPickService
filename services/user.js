const redisJson = require('../services/redis');
const cuid = require('cuid');
const RoomService = require('./room');

function UserService() {
    this._updateData = function(room, user) {
        const userIndex = room.users.findIndex(usr => usr.uid === user.uid);
        if (userIndex == null || userIndex == -1) {
            throw new Error('Unable to find user');
        }

        room.users[userIndex] = user;
    }
    
    this.insertOrUpdate = async function(roomCode, user) {
        const room = await RoomService.getRoom(roomCode);

        if (room == null) {
            throw new Error('Unable to retrieve room');
        }

        if (room.users == null) {
            room.users = [];
        }

        if (user == null) {
            user = {
                uid: cuid(),
                finished: false
            };

            room.users.push(user);

            try {
                await RoomService.insertOrUpdate(room);
                
                return user;
            } catch(error) {
                throw new Error('Unable to create new user', error);
            }
        } else {
            try {
                this._updateData(room, user);

                try {
                    await RoomService.insertOrUpdate(room);
                    
                    return user;
                } catch(error) {
                    throw new Error('Unable to create new user', error);
                }
            } catch(error) {
                throw new Error('Unable to update user', error);
            }
        }
    }

    this.getUser = async function(uid) {
        const room = await RoomService.getRoom(roomCode);
        
        if (room == null) {
            throw new Error('Unable to retrieve room');
        }

        const user = room.users.find(usr => usr.uid === uid);

        if (user == null) {
            throw new Error('Unable to find user');
        }

        return user;
    }
}

module.exports = new UserService();
