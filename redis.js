const redis = require('./redis/index.js');
var config = {
    host: '119.23.104.164',
    port: 6379,
    db: 2,
    password: 'qweasdzxc',
    prefix: 'test_',
    retry_strategy: function (options) {
        // console.log('retry_strategy', options);
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            return new Error('Attempt time exhausted');
        }
        console.log('reconnect after: '+ Math.min(options.attempt * 500, 30*1000));
        // reconnect after
        return Math.min(options.attempt * 100, 30000);
    }
};

client = redis.createClient(config);

client.on("error", function (err) {
    console.error("redis take error ."+ err);
    if(err.code === 'NR_CLOSED'){
        console.error("redis reconnect");
        // client = redis.createClient(config)
    }
});

function get(key) {
    return new Promise(function (resolve, reject) {
        // if(!config.useCache) return resolve(null);

        client.get(key, function (err, value) {
            if (err) {
                console.error('get data from redis take error.', err);
                return resolve(null);
            }
            if(value =="undefined" || !value){
                value = undefined;
            }
            return resolve(value);
        });
    });
}

// 单位为秒
const timeStrBaseMapping = {
    'y': 31536000,
    'M': 2592000,
    'd': 86400,
    'h': 3600,
    'm': 60
};

/**
 *
 * @param key
 * @param value
 * @param expires  seconds
 */
function set(key,value,expires) {
    if(typeof value != "string"){
        value = JSON.stringify(value);
    }

    var secs = expires || 300;
    if(typeof expires == "string"){
        secs = 300;
        var match = expires.match(/(\d+)(h)/) || expires.match(/(\d+)(m)/)
            || expires.match(/(\d+)(d)/) || expires.match(/(\d+)(M)/) || expires.match(/(\d+)(y)/);
        if(match && match.length==3) {
            var num = parseFloat(match[1]) || 30;
            var timestr = match[2];
            var base = timeStrBaseMapping[timestr] || 60;
            secs = num * base;
        }
    }
    
	console.log('set redis key: '+ key);
    client.set(key, value, 'EX', secs);
    // client.expire(key, seconds);
}
exports.get = get;
exports.set = set;