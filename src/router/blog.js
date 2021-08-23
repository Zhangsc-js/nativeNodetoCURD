const { SuccessModel, ErrorModel } = require('../model/resModel')
const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog,
} = require('../controller/blog')
const handleBlogRouter = (req, res) => {
  // 提取id 和 methods: {
  const method = req.method
  const id = req.query.id
  //获取博客列表
  if (method === 'GET' && req.path === '/api/blog/list') {
    let author = req.query.author || ''
    const keyword = req.query.keyword || ''
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
    req.body.author = `zhangsan`
    return newBlog(req.body).then((result) => {
      return new SuccessModel(result)
    })
  }

  //更新博客
  if (method === 'POST' && req.path === '/api/blog/update') {
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
    return delBlog(id, 'zhangsan').then((result) => {
      if (result) {
        return new SuccessModel(result)
      } else {
        return new ErrorModel('删除博客失败')
      }
    })
  }
}

module.exports = handleBlogRouter
