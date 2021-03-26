const Redis = require('ioredis');
const redisJSON = require('redis-json');
const { exec } = require("child_process");

let connectAttempts = 0;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const redis = new Redis(REDIS_PORT);
const redisJson = new redisJSON(redis);

redis.on('error', (error) => {
    if (error.code === 'ECONNREFUSED') {
        connectAttempts++
        if (connectAttempts > 15) {
            redis.quit();
            console.log('Shutting down Node Server & Redis, cannot connect to Redis');
            shutDownService();
        }
    }
});

function shutDownService() {
    exec("pm2 stop index", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}

module.exports = redisJson;