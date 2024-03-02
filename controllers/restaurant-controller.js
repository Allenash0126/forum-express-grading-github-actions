const { Restaurant, Category } = require('../models')

const restaurantsController = {
  getRestaurants: (req, res, next) => {
    const categoryId = Number(req.query.categoryId) || ''
    return Promise.all([
      Restaurant.findAll({
        where: {
          ... categoryId ? { categoryId } : {}
        },
        raw: true,
        nest: true, 
        include: [Category]
      }),
      Category.findAll({raw: true})
    ])
      .then(([restaurants, categories]) => {
        const data = restaurants.map(r => ({
          ...r, 
          description: r.description.substring(0, 50)
        }))
        return res.render('restaurants', { 
          restaurants: data, 
          categories, 
          categoryId 
        })
      })
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category
    })
    .then((restaurant) => {
      restaurant.increment('viewCounts', { by: 1 })
      return res.render('restaurant', { 
        restaurant: restaurant.toJSON()
      })      
    })
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: Category
    })
      .then((restaurant) => {
        if(!restaurant) throw new Error('It does not exist:(')
        return res.render('dashboard', { restaurant })
      })         
      .catch(err => next(err))
  }   
}
module.exports = restaurantsController
