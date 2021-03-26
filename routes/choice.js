const express = require('express');
const router = express.Router();
const LobbyService = require('../services/lobbyservice');
const UserService = require('../services/userservice');
const RestaurantService = require('../services/restaurantservice');

router.post('/:lobbyCode', async (req, res) => {
    const {lobbyCode} = req.params;
    const {uid, restaurantId} = req.body;

    if ((restaurantId == null || restaurantId === '') 
        || (lobbyCode == null || lobbyCode === '')
        || (uid == null || uid === '')) {
        return res.status(400).send('Lobby code & place id & user id are required');
    }

    try {
        const user = await RestaurantService.addRestaurant(lobbyCode, uid, restaurantId);

        res.send({
            lobbyCode,
            user
        });
        //if another user selected this alert them!
        //or maybe wait until the end?
    } catch (error) {
        res.status(500).send(`Unable to add restaurant: ${error}`);
    }
});

//test finished
router.post('/:lobbyCode/finished', async (req, res) => {
    const {lobbyCode} = req.params;
    const {uid} = req.body;

    if (uid == null || uid === '') {
        return res.status(400).send('User Id is required');
    }

    try {
        const lobby = await LobbyService.getLobby(lobbyCode);
        const user = await UserService.getUser(lobbyCode, uid);
    
        if (user.finished && !lobby.finished) { //waiting for partner still..
            return res.send({
                lobbyCode,
                user,
                roomIsFinished: false
            });
        }
    
        if (!user.finished) {
            if (bothUsersAreFinished(lobby.users)) { //booth have finished
                lobby.matches = RestaurantService.getMatchedRestaurants(lobby);
                lobby.finished = true;
                user.finished = true;
                await UserService.update(lobby, user);
                await LobbyService.update(lobby);
    
                return res.send({
                    lobbyCode,
                    user,
                    matches: lobby.matches,
                    roomIsFinished: true
                });
            } else { //first person finishing
                user.finished = true;
                await UserService.update(lobby, user);
    
                return res.send({
                    lobbyCode,
                    user,
                    roomIsFinished: false
                });
            }
        }
    
        res.send({
            lobbyCode,
            user,
            matches: lobby.matches,
            roomIsFinished: true
        });
    
        LobbyService.delete(lobbyCode);
    } catch(error) {
        res.status(500).send(`Unable to finish: ${error}`)
    }
});

function bothUsersAreFinished(users) {
    return users.filter(user => user.finished).length >= 1;
}

module.exports = router;