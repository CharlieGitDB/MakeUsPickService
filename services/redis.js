const Redis = require('ioredis');
const redisJSON = require('redis-json');

let redisJson;
try {
    const REDIS_PORT = process.env.REDIS_PORT || 6379;
    const redis = new Redis(REDIS_PORT);
    redisJson = new redisJSON(redis);
    redisJson.set('init', true);
    redisJSON.get('init');
} catch(error) {
    console.log(error, 'tried to connect to redis failed');
    process.exit(0);
}

module.exports = redisJson;