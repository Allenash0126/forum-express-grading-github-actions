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
  },
  createRestaurants: (req, res) => {
    res.render('admin/create-restaurant')
  },
  postRestaurants: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('Restaurant name is required!')

    Restaurant.create({ name, tel, address, openingHours, description })
      .then(() => {
        req.flash('success', 'Restaurant was created successfully!')
        res.redirect('/admin/restaurants')
      })
      .catch(error => next(error))
  },
  getRestaurant: (req, res, next) => {
    // rest_id 被定義在 admin.js
    Restaurant.findByPk(req.params.rest_id, {
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("The restaurant doesn't exist :(")
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  }
}
module.exports = adminController
