const { Restaurant, User, Category } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

const adminController = {
  getRestaurants: (req, cb) => {
    Restaurant.findAll({
      raw: true,
      nest:true,
      include: [Category]
    })
      .then(restaurants =>  cb(null, { restaurants }))
      .catch(error => cb(error))
  },
  postRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')

    const { file } = req

    localFileHandler(file)
      .then(filePath => Restaurant.create({ name, tel, address, openingHours, description, categoryId, image: filePath || null }))
      .then(newRestaurant => cb(null, { restaurant: newRestaurant }))
      .catch(error => cb(error))  
  },  
  deleteRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.rest_id)
      .then(restaurant => {
        if (!restaurant) {
          const err = new Error("Restaurant didn't exist!")
          err.status = 404
          throw err
        }
        return restaurant.destroy()
      })
      .then((deletedRestaurant) => cb(null, { restaurant: deletedRestaurant }))
      .catch(err => cb(err))
  }  
}

module.exports = adminController
