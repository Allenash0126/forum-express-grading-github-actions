const { Category } = require('../models')
const categoryController = {
  getCategories: (req, res, next) => {
    return Promise.all([
      Category.findAll({raw: true}),
      req.params.id ? Category.findByPk(req.params.id,{raw: true}) : null
    ])
      .then(([categories, category]) => {
        res.render('admin/categories', { categories, category })
      })
      .catch(err => next(err))
  },
  postCategories: (req, res, next) => {
    const { name } = req.body
    if(!name) throw new Error('Category name is required!')
    return Category.create({name})
      .then(() => {
        req.flash('success_messages', 'Category新增成功!')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  }, 
  putCategory: (req, res, next) => {
    const { name } = req.body
    if(!name) throw new Error('Category name is required!')
    return Category.findByPk(req.params.id)
      .then((category) => {
        if(!category) throw new Error('It does not exist :(')
        return category.update({ name })
      })
      .then(() => {
        req.flash('success_messages', '編輯成功！')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },
  deleteCategory: (req, res, next) => {
    return Category.findByPk(req.params.id)
      .then((category) => {
        if(!category) throw new Error('It does not exist :(')
        return category.destroy()
      })
      .then(() => {
        req.flash('success_messages', '刪除成功！')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  }
}

module.exports = categoryController