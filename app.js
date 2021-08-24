const queryString = require('querystring')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')
const { get, set } = require('./src/db/redis')
const { access } = require('./src/util/log')

// 获取cookie的过期时间
const getCookieExpires = () => {
  const d = new Date()
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000)
  return d.toGMTString()
}

const getPostData = (req) => {
  return new Promise((resolve, reject) => {
    if (req.method !== 'POST') return resolve({})
    if (req.headers['content-type'] !== 'application/json') return resolve({})
    let postData = ''
    req.on('data', (chunk) => {
      postData += chunk.toString()
    })
    req.on('end', () => {
      if (!postData) return resolve({})
      resolve(JSON.parse(postData))
    })
  })
}

// 解析cookie   处理成键值对 存入req.cookie中
const parseCookie = (req) => {
  let cookie = {}
  let cookieStr = req.headers.cookie || '' // k1=v1;k2=v2
  cookieStr.split(';').forEach((item) => {
    if (!item) return
    const arr = item.split('=')
    const key = arr[0].trim()
    const val = arr[1]
    cookie[key] = val
  })
  return cookie
}

const serverHandle = (req, res) => {
  // 记录  access  log
  access(
    `${req.method} -- ${req.url} -- ${
      req.headers['user-agent']
    } -- ${Date.now()}`
  )
  // 设置返回格式
  res.setHeader('Content-type', 'application/json')
  // path 处理
  const url = req.url
  const path = url.split('?')[0]
  req.path = path

  // 处理queryString
  req.query = queryString.parse(url.split('?')[1])

  // 解析cookie
  const cookie = parseCookie(req)
  req.cookie = cookie

  // 解析 session
  let needSetCookie = false
  let userId = req.cookie.userid
  if (!userId) {
    needSetCookie = true
    userId = `${Date.now()}_${Math.random()}`
  }
  req.sessionId = userId
  // 通过 userId 获取存储在 redis 中的数据
  get(req.sessionId)
    .then((sessionData) => {
      if (!sessionData) {
        // 当对应的 sessionId 在 redis 中没有值的时，在 redis 中将其值设置为空对象
        set(req.sessionId, {})
        req.session = {}
      } else {
        req.session = sessionData
      }
      return getPostData(req)
    })
    // 处理post 请求数据
    .then((postData) => {
      req.body = postData
      // 处理 blog 路由
      const blogResult = handleBlogRouter(req, res)
      if (blogResult) {
        if (needSetCookie) {
          res.setHeader(
            'Set-Cookie',
            `userid = ${userId};path=/;httpOnly;expires = ${getCookieExpires()}`
          )
        }
        blogResult.then((blogData) => {
          res.end(JSON.stringify(blogData))
        })
        return
      }
      // 处理user路由
      const userRouter = handleUserRouter(req, res)
      if (userRouter) {
        if (needSetCookie) {
          res.setHeader(
            'Set-Cookie',
            `userid = ${userId};path=/;httpOnly;expires = ${getCookieExpires()}`
          )
        }
        userRouter.then((userData) => {
          res.end(JSON.stringify(userData))
        })
        return
      }
      // 不匹配返回404
      res.writeHead(404, { 'Content-type': 'text/plain' })
      res.write('404 Not Found')
      res.end()
    })
}
module.exports = serverHandle
