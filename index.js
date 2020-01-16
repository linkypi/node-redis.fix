const express = require('express')
const redis = require('./redis')
const app = express()

app.get('/',async(req, res) =>  {
    
    redis.set('xxx','nimabi','4m');
    var result = await redis.get('xxx');
    res.send('Hello World!, cache: '+ result)

}
)

app.listen(3000, () => console.log('Example app listening on port 3000!'))