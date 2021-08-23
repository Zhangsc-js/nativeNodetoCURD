const { exec } = require('../db/mysql')

const getList = (author, keyWord) => {
  let sql = `select * from blogs where 1=1 `
  if (author) {
    sql += `and author = '${author}' `
  }
  if (keyWord) {
    sql += `and title like '${keyWord}' `
  }
  sql += `order by createtime desc;`
  return exec(sql)
}

const getDetail = (id) => {
  let sql = `select * from blogs where id = ${id} `
  sql += `order by createtime desc;`
  return exec(sql).then((result) => {
    return result[0]
  })
}

const newBlog = (blogData = {}) => {
  const { title, content, author } = blogData
  const createTime = Date.now()
  const sql = `
    insert into blogs (title,content,author,createtime) values ('${title}','${content}','${author}',${createTime})
  `
  return exec(sql).then((insertData) => {
    return {
      id: insertData.insertId,
    }
  })
}

const updateBlog = (id, blogData = {}) => {
  const { title, content } = blogData
  const sql = `
    update blogs set title = '${title}', content = '${content}' where id = ${id};
  `
  return exec(sql).then((updateData) => {
    if (updateData.affectedRows > 0) return true
    return false
  })
}

const delBlog = (id, author) => {
  const sql = `
    delete from blogs where id = ${id} and author = '${author}';
  `
  return exec(sql).then((delData) => {
    if (delData.affectedRows > 0) return true
    return false
  })
}

module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog,
}
