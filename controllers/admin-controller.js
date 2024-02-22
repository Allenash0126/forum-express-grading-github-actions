const { Restaurant } = require('../models')
// 解構賦值如下
// const db = require('../models')
// const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true
    })
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
      .catch(error => next(error))
  }
}
module.exports = adminController
