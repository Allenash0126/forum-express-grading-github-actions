const { Restaurant, Category, User, Comment } = require('../models')
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
        const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(fr => fr.id) 
        const likedRestaurantsId = req.user && req.user.LikedRestaurants.map(lr => lr.id)
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id),
          isLiked: likedRestaurantsId.includes(r.id)
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
      include: [
        Category,
        { model: Comment, include: User},
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ]
    })
    .then((restaurant) => {
      const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
      const isLiked = restaurant.LikedUsers.some(lu => lu.id === req.user.id)
      restaurant.increment('viewCounts', { by: 1 })
      return res.render('restaurant', { 
        restaurant: restaurant.toJSON(),
        isFavorited,
        isLiked
      })      
    })
    .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category, 
        Comment
      ]
    })
      .then((restaurant) => {
        if(!restaurant) throw new Error('It does not exist:(')
        const rToJSON = restaurant.toJSON()
        // rToJSON.commentCounts = rToJSON.Comments.length // AC測試檔在js讀不到length，故將length 移至 dashboard.hbs

        return res.render('dashboard', { 
          restaurant: rToJSON,
        })
      })         
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    Promise.all([
      Restaurant.findAll({
        limit: 10, 
        order: [['createdAt', 'desc']],
        include: [ Category ],
        nest: true,
        raw: true        
      }),
      Comment.findAll({
        include: [ User, Restaurant ],        
        limit: 10,
        order: [['createdAt', 'desc']],
        nest: true,
        raw: true
      })
    ])
      .then(([restaurants, comments]) => {
        return res.render('feeds', { restaurants, comments })
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantsController
