const { Restaurant, Category } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantsController = {
  getRestaurants: (req, res, next) => {
    const defaultLimit = 9
    const categoryId = Number(req.query.categoryId) || ''
    const limit = Number(req.query.limit) || defaultLimit
    const page = Number(req.query.page) || 1
    const offset = getOffset(limit, page)

    return Promise.all([
      Restaurant.findAndCountAll({
        where: {
          ... categoryId ? { categoryId } : {}
        },
        raw: true,
        nest: true, 
        offset, 
        limit,
        include: [Category]
      }),
      Category.findAll({raw: true})
    ])
      .then(([restaurants, categories]) => {
        const data = restaurants.rows.map(r => ({
          ...r, 
          description: r.description.substring(0, 50)
        }))
        return res.render('restaurants', { 
          restaurants: data, 
          categories, 
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
          // pagination: getPagination(limit, page)
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
