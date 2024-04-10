const { Category } = require('../../models')
const categoryServices = require('../../services/category-services')

const categoryController = {
  getCategories: (req, res, next) => {    
    categoryServices.getCategories(req, (err, data) => err ? next(err) : res.render('admin/categories', data ))
  },
  postCategories: (req, res, next) => {
    categoryServices.postCategories(req, (err, data) => {
      if (err) return next(err)
      req.session.postCategories = data
      req.flash('success_messages', '新增成功！')
      return res.redirect('/admin/categories')     
    })
  }, 
  putCategory: (req, res, next) => {
    categoryServices.putCategory(req, (err, data) => {
      if (err) return next(err)
      req.session.putCategory = data
      req.flash('success_messages', '編輯成功！')
      return res.redirect('/admin/categories')     
    })
  },
  deleteCategory: (req, res, next) => {
    categoryServices.deleteCategory(req, (err, data) => {
      if (err) return next(err)
      req.session.deletedCategory = data
      req.flash('success_messages', '刪除成功！')
      return res.redirect('/admin/categories')     
    })    
  }
}

module.exports = categoryController