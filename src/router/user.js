const { login } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const handleUserRouter = (req, res) => {
  //登录
  if (req.method === 'POST' && req.path === '/api/user/login') {
    const { username, password } = req.body
    return login(username, password).then((result) => {
      if (result.username) {
        // 设置session
        req.session.username = result.username
        req.session.realname = result.realname

        // 同步到 redis中
        // set(req.sessionId, req.session)
        return new SuccessModel(result)
      } else {
        return new ErrorModel('登录失败')
      }
    })
  }
}

module.exports = handleUserRouter
