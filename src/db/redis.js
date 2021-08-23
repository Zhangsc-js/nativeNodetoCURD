const redis = require('redis')
const { REDID_CONF } = require('../conf/db')

// 创建客户端
const redisClient = redis.createClient(REDID_CONF.port, REDID_CONF.host)
redisClient.on("error", err => {
  console.log(err)
})

function set(key, val) {
  if (typeof val === 'object') {
    val = JSON.stringify(val)
  }
  redisClient.set(key, val, redis.print)
}

function get(key) {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, val) => {
      if (err) return reject(err)
      if (val == null) return resolve(null)

      // 兼容json转化的格式
      try {
        resolve(JSON.parse(val))
      } catch (err) {
        resolve(val)
      }
    })
  })
}

module.exports = {
  set,
  get
}