const express = require('express');
const router = express.Router();
const redisJson = require('../services/redis');

//change placeid to restaurantid
router.post('/:roomCode', async (req, res) => {
    const {roomCode} = req.params;
    const {uid, restaurantId} = req.body;

    if ((restaurantId == null || restaurantId === '') 
        || (roomCode == null || roomCode === '')
        || (uid == null || uid === '')) {
        return res.status(400).send('Room code & place id & user id are required');
    }

    const room = await redisJson.get(roomCode);

    if (room == null) {
        return res.status(500).send('Unable to find room');
    }

    let user = room.users.find(usr => usr.uid === uid);

    if (user == null) {
        return res.status(500).send('Unable to find user');
    }

    if (!restaurantExists(restaurantId, room.restaurants)) {
        return res.status(500).send('Invalid restaurant id');
    }

    if (user.select == null) user.selected = [];
    user.selected.push(restaurantId);
    setUserData(room, user);
    redisJson.set(roomCode, room);

    //if another user selected this alert them!
    //or maybe wait until the end?

    res.send({
        roomCode,
        user
    });
});

router.post('/:roomCode/finished', async (req, res) => {
    const {roomCode} = req.params;
    const {uid} = req.body;

    //make these checks a .use('/', function()) middleware to check for this stuff
    if (uid == null || uid === '') {
        return res.status(400).send('User Id is required');
    }

    const room = await redisJson.get(roomCode);

    if (room == null) {
        return res.status(500).send('Unable to find room');
    }

    let user = room.users.find(usr => usr.uid === uid);

    if (user == null) {
        return res.status(500).send('Unable to find user');
    }

    if (user.finished && !room.finished) { //waiting for partner still..
        return res.send({
            roomCode,
            user,
            roomIsFinished: false
        });
    }

    if (!user.finished) {
        if (bothUsersAreFinished(room.users)) { //booth have finished
            room.matches = getMatchedRestaurants(room);
            room.finished = true;
            user.finished = true;
            setUserData(room, user);
            redisJson.set(roomCode, room);

            return res.send({
                roomCode,
                user,
                matches: room.matches,
                roomIsFinished: true
            });
        } else { //first person finishing
            user.finished = true;
            setUserData(room, user);
            redisJson.set(roomCode, room);

            return res.send({
                roomCode,
                user,
                roomIsFinished: false
            });
        }
    }

    res.send({
        roomCode,
        user,
        matches: room.matches,
        roomIsFinished: true
    });

    //clear room out of redis
    redisJson.del(roomCode);
});

function setUserData(room, user) {
    const userIndex = room.users.findIndex(usr => usr.uid === user.uid);
    room.users[userIndex] = user;
}

function bothUsersAreFinished(users) {
    return users.filter(user => user.finished).length >= 1;
}

function restaurantExists(restaurantId, restaurants) {
    return restaurants.filter(restaurant => restaurant.id == restaurantId).length > 0;
}

function getMatchedRestaurants(room) {
    let matches = [];
    let fullMatches = [];
    let userOneChoices = room.users[0].selected;
    if (userOneChoices.length > 0 && room.users[1].selected.length > 0) {
        room.users[1].selected.forEach(choice => {
            if (userOneChoices.includes(choice)) {
                matches.push(choice);
            }
        });

        room.restaurants.forEach(restaurant => {
           matches.forEach(match => {
               if (restaurant.id === match) {
                   fullMatches.push(restaurant);
               }
           }); 
        });
    }



    return fullMatches;
}

module.exports = router;