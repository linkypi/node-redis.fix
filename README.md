### 修复node-redis连接关闭后不再重连的bug
修复当连接关闭后，客户端再次发起请求时node-redis不再发起重新连接的bug. 该问题会导致Redis长期不可用，服务端总是报错: The connection is already closed。

即在重试策略完成后，客户端再次发起请求时会导致该问题
``` js
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
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    }
```

该问题已经提交相关 [issue](https://github.com/NodeRedis/node_redis/issues/1488)