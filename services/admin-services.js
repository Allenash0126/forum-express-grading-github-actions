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
  }
}

module.exports = adminController
