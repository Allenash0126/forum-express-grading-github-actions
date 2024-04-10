const { Category } = require('../models')

const categoryServices = {
  getCategories: (req, cb) => {
    return Promise.all([
      Category.findAll({raw: true}),
      req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null
    ])
      .then(([categories, category]) => {
        cb(null, { categories, category })
      })
      .catch(err => cb(err))
  }, 
  putCategory: (req, cb) => {
    const { name } = req.body
    if(!name) throw new Error('Category name is required!')
    return Category.findByPk(req.params.id)
      .then((category) => {
        if(!category) throw new Error('It does not exist :(')
        return category.update({ name })
      })
      .then(name => cb(null, name))
      .catch(err => cb(err))
  },
  postCategories: (req, cb) => {
    const { name } = req.body
    if(!name) throw new Error('Category name is required!')
    return Category.create({name})
      .then(name => cb(null, name))
      .catch(err => cb(err))
  },
  deleteCategory: (req, cb) => {
    return Category.findByPk(req.params.id)
      .then((category) => {
        if(!category) throw new Error('It does not exist :(')
        return category.destroy()
      })
      .then(deletedCategory => cb(null, deletedCategory))
      .catch(err => cb(err))
  }

}

module.exports = categoryServices
