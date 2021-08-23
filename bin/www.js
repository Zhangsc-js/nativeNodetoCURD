const http = require('http')
const PORT = 3001
const serverHandle = require('../app')

// 创建 服务
const server = http.createServer(serverHandle)

server.listen(PORT)
