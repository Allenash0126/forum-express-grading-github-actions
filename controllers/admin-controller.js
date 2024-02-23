const { Restaurant } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')
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

    const { file } = req

    localFileHandler(file)
      .then(filePath => Restaurant.create({ name, tel, address, openingHours, description, image: filePath || null }))
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
  },
  editRestaurant: (req, res, next) => {
    // rest_id 被定義在 admin.js
    Restaurant.findByPk(req.params.rest_id, {
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("The restaurant doesn't exist :(")
        res.render('admin/edit-restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('Restaurant name is required!')

    const { file } = req

    Promise.all([
      Restaurant.findByPk(req.params.rest_id),
      localFileHandler(file)
    ])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image
        })
      })
      .then(() => {
        req.flash('success', 'restaurant was successfully to update')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.rest_id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.destroy()
      })
      .then(() => res.redirect('/admin/restaurants'))
      .catch(err => next(err))
  }
}

module.exports = adminController
