const express = require('express');
const router = express.Router();
const LobbyService = require('../services/lobbyservice');
const RestaurantService = require('../services/restaurantservice');
const UserService = require('../services/userservice');

router.post('/create/:postalCode', async (req, res) => {
    const {postalCode} = req.params;

    if (postalCode == null || postalCode === '') {
        return res.status(400).send('Postal Code is required');
    }

    try {
        const restaurants = await RestaurantService.getRestaurants(postalCode);
        const lobby = await LobbyService.create(restaurants);
        const user = await UserService.create(lobby.lobbyCode);

        res.send({
            uid: user.uid,
            lobbyCode: lobby.lobbyCode,
            restaurants: lobby.restaurants
        });
    } catch(error) {
        res.status(500).send(`Unable to create lobby: ${error}`);
    }
});

router.post('/join/:lobbyCode', async (req, res) => {
    const {lobbyCode} = req.params;

    if (lobbyCode == null || lobbyCode === '') {
        return res.status(400).send('Lobby code is required');
    }

    try {
        const lobby = await LobbyService.getLobby(lobbyCode);
        const joinedUser = await UserService.create(lobby.lobbyCode);

        if (lobby.users.length >= 2) {
            return res.status(500).send('Unable to join lobby: Lobby is full');
        }

        res.send({
            uid: joinedUser.uid,
            lobbyCode,
            restaurants: lobby.restaurants.reverse()
        });
    } catch(error) {
        throw new Error(`Unable to join lobby: ${error}`);
    }
});

router.get('/poll/:lobbyCode', async (req, res) => {
    const {lobbyCode} = req.params;

    if (lobbyCode == null || lobbyCode === '') {
        return res.status(400).send('Lobby code is required');
    }

    try {
        const lobby = await LobbyService.getLobby(lobbyCode);
        return res.send(lobby.users.length >= 2);
    } catch(error) {
        throw new Error(`Unable to find lobby: ${error}`)
    }
});

module.exports = router;