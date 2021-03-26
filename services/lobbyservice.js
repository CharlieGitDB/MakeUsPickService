const redisJson = require('./redis');
const generator = require('generate-password');

function LobbyService() {
    const ONE_MINUTE = 60 * 1000;
    const ONE_HOUR = ONE_MINUTE * 2;
    const EXPIRE_TIME = {expire: ONE_HOUR * 2};

    this.create = async function(restaurants) {
        const lobbyCode = await this._generateLobbyCode();
        let lobby = {
            lobbyCode,
            restaurants,
            finished: false
        };
    
        await redisJson.set(lobbyCode, lobby, EXPIRE_TIME);
    
        return lobby;
    }

    this.update = async function(lobby) {
        if (lobby == null || lobby.lobbyCode == null) {
            throw new Error('Unable to retrieve lobby');
        }
    
        await redisJson.set(lobby.lobbyCode, lobby, EXPIRE_TIME);
        
        return lobby;
    }

    this.delete = async function(lobbyCode) {
        if (lobbyCode == null || lobbyCode == '') {
            throw new Error('Unable to find lobby');
        }

        redisJson.del(lobbyCode);
    }

    this.getLobby = async function(lobbyCode) {
        try {
            const lobby = await redisJson.get(lobbyCode);
            return lobby;
        } catch(error) {
            throw new Error('Unable to retrieve lobby', error);
        }
    }
    
    this._generateLobbyCode = async function() {
        let lobbyCode = this._generateCode();
    
        let lobby = await redisJson.get(lobbyCode)
        if (lobby != null) {
            while (lobby != null) {
                lobbyCode = this._generateCode();
                lobby = await redisJson.get(lobbyCode);
            }
        }
    
        return lobbyCode;
    }

    this._generateCode = function() {
        return generator.generate({
            length: 8
        }).toUpperCase();
    }
}

module.exports = new LobbyService();