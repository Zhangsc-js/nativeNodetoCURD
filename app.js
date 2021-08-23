const queryString = require('querystring')
const handleBlogRouter = require('./router/blog')
const handleUserRouter = require('./router/user')

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

const serverHandle = (req, res) => {
  // 设置返回格式
  res.setHeader('Content-type', 'application/json')
  // path 处理
  const url = req.url
  const path = url.split('?')[0]
  req.path = path

  // 处理queryString
  req.query = queryString(url.split('?')[1])
  // 处理 post请求数据
  getPostData(req).then((postData) => {
    req.body = postData
    // 处理 blog 路由
    const blogResult = handleBlogRouter(req, res)
    if (blogResult) {
      blogResult.then((blogData) => {
        res.end(JSON.stringify(blogData))
      })
    }
    // 处理user路由
    const userRouter = handleUserRouter(req, res)
    if (userRouter) {
      userRouter.then((userData) => {
        res.end(JSON.stringify(userData))
      })
    }
    // 不匹配返回404
    res.writeHead(404, { 'Content-type': 'text/plain' })
    res.write('404 Not Found')
    res.end()
  })
}
module.exports = serverHandle
