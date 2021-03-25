const express = require('express');
const router = express.Router();
const generator = require('generate-password');
const redisJson = require('../services/redis');
const cuid = require('cuid');
const getRestaurants = require('../services/restaurants');

router.post('/create/:postalCode', async (req, res) => {
    const { postalCode } = req.params;

    if (postalCode == null || postalCode === '') {
        return res.status(400).send('Postal Code is required');
    }

    const roomCode = await generateRoomCode();
    const newUserId = cuid();
    let restaurants;

    try {
        restaurants = await getRestaurants(postalCode);
    } catch(error) {
        return res.status(500).send(`Unable to create room: ${error}`);
    }

    let newRoom = {
        roomCode,
        users: [
            {
                uid: newUserId,
                finished: false
            }
        ],
        restaurants,
        finished: false
    };
    
    redisJson.set(roomCode, newRoom);

    res.send({
        uid: newUserId,
        roomCode,
        restaurants
    });
});

router.post('/join/:roomCode', async (req, res) => {
    const {roomCode} = req.params;

    if (roomCode == null || roomCode === '') {
        return res.status(400).send('Room code is required');
    }

    const room = await redisJson.get(roomCode);

    if (room == null) {
        return res.status(500).send('Unable to find room');
    }
    if (room.users.length >= 2) {
        return res.status(500).send('Room is full');
    }

    const joinedUser = {
        uid: cuid(),
        finished: false
    }
    
    room.users.push(joinedUser);

    redisJson.set(roomCode, room);

    res.send({
        uid: joinedUser.uid,
        roomCode,
        restaurants: room.restaurants.reverse()
    });
});

router.get('/poll/:roomCode', async (req, res) => {
    const {roomCode} = req.params;

    if (roomCode == null || roomCode === '') {
        return res.status(400).send('Room code is required');
    }

    const room = await redisJson.get(roomCode);

    if (room == null) {
        return res.status(500).send('Unable to find room');
    }

    return res.send(room.users.length >= 2);
});

async function generateRoomCode() {
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

module.exports = router;