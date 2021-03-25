const Redis = require('ioredis');
const redisJSON = require('redis-json');

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const redis = new Redis(REDIS_PORT);
const redisJson = new redisJSON(redis);

module.exports = redisJson;