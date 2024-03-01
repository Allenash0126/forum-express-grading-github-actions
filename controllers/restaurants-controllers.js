const { Restaurant, Category } = require('../models')

const restaurantsController = {
  getRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      raw: true,
      nest: true, 
      include: [Category]
    })
      .then((restaurants) => {
        const data = restaurants.map(r => ({
          ...r, 
          description: r.description.substring(0, 50)
        }))
        return res.render('restaurants', { restaurants: data })
      })
  },
  getRestaurant: (req, res, next) => {
    const { id } = req.params
    return Restaurant.findByPk(id, {
      raw: true, 
      nest: true,
      include: Category
    })
    .then((restaurant) => {
      res.render('restaurant', { restaurant })
    })
  }
}
module.exports = restaurantsController
