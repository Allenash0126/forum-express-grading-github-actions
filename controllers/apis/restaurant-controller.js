const restaurantServices = require('../../services/restaurant-services')

const restaurantsController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.json(data))    
  }
}

module.exports = restaurantsController
