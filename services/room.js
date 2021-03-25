const redisJson = require('../services/redis');
const getRestaurants = require('../services/restaurants');

function LobbyService() {
    this.createRoom = async function() {
        let restaurants;
    
        try {
            restaurants = await getRestaurants(postalCode);
        } catch(error) {
            throw new Error('Unable to retrieve restaurants', error);
        }
    
        const roomCode = await this._generateRoomCode();
        let room = {
            roomCode,
            restaurants,
            finished: false
        };
    
        try {
            await redisJson.set(roomCode, room);
        } catch(error) {
            throw new Error('Unable to save room', error);
        }
    
        return room;
    }

    this.insertOrUpdate = async function(room) {
        if (room == null || room.roomCode == null) {
            return await this.createRoom();
        }
    
        try {
            await redisJson.set(roomCode, room);
        } catch(error) {
            throw new Error('Unable to save room', error);
        }
    
        return room;
    }

    this.getRoom = async function(roomCode) {
        try {
            return await redisJson.get(roomCode);
        } catch(error) {
            throw new Error('Unable to retrieve room', error);
        }
    }
    
    this._generateRoomCode = async function() {
        let roomCode = generator.generate({
            length: 8
        }).toUpperCase();
    
        let room = await redisJson.get(roomCode)
        if (room != null) {
            while (room != null) {
                roomCode = generateRoomCode();
                room = await redisJson.get(roomCode);
            }
        }
    
        return roomCode;
    }
}

module.exports = new LobbyService();