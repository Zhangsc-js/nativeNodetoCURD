const fs = require('fs')
const path = require('path')

// 写日志
function writeLog(writeStream, log) {
  writeStream.write(log + '\n')
}

//生成write Stream
function createWriteStream(filename) {
  const fullFileName = path.join(__dirname, '../', '../', 'logs', filename)
  const writeStream = fs.createWriteStream(fullFileName, {
    flags: 'a',
  })
  return writeStream
}

// 写访问日志
const accessWriteStream = createWriteStream('access.log')
function access(log) {
  writeLog(accessWriteStream, log)
}

module.exports = {
  access,
}
