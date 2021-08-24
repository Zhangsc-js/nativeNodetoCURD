const { SuccessModel, ErrorModel } = require('../model/resModel')
const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog,
} = require('../controller/blog')

const loginCheck = (req) => {
  if (!req.session.username) {
    return Promise.resolve(new ErrorModel('尚未登录'))
  }
}

const handleBlogRouter = (req, res) => {
  // 提取id 和 methods: {
  const method = req.method
  const id = req.query.id
  //获取博客列表
  if (method === 'GET' && req.path === '/api/blog/list') {
    let author = req.query.author || ''
    const keyword = req.query.keyword || ''
    if (req.query.isadmin) {
      // 管理员界面
      const loginCheckResult = loginCheck(req)
      if (loginCheckResult) {
        //未登录
        return loginCheckResult
      }
      // 强制查询自己的博客
      author = req.session.username
    }
    return getList(author, keyword).then((data) => {
      return new SuccessModel(data)
    })
  }

  //获取博客详情
  if (method === 'GET' && req.path === '/api/blog/detail') {
    return getDetail(id).then((data) => {
      return new SuccessModel(data)
    })
  }

  //新建博客
  if (method === 'POST' && req.path === '/api/blog/new') {
    // 登录验证
    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) return loginCheckResult

    req.body.author = req.session.username
    return newBlog(req.body).then((result) => {
      return new SuccessModel(result)
    })
  }

  //更新博客
  if (method === 'POST' && req.path === '/api/blog/update') {
    // 登录验证
    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) return loginCheckResult

    const blogData = req.body
    return updateBlog(id, blogData).then((result) => {
      if (result) {
        return new SuccessModel(result)
      } else {
        return new ErrorModel('更新博客失败')
      }
    })
  }

  //删除博客
  if (method === 'POST' && req.path === '/api/blog/del') {
    // 登录验证
    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) return loginCheckResult

    return delBlog(id, req.session.username).then((result) => {
      if (result) {
        return new SuccessModel(result)
      } else {
        return new ErrorModel('删除博客失败')
      }
    })
  }
}

module.exports = handleBlogRouter
