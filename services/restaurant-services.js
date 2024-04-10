const { Restaurant, Category, Comment, User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantServices = {
  getRestaurants: (req, cb) => {
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
      const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) :[]
      const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []
      const data = restaurants.rows.map(r => ({
        ...r, 
        description: r.description ? r.description.substring(0, 50) : [], // 避免找不到 description
        isFavorited: favoritedRestaurantsId.includes(r.id),
        isLiked: likedRestaurantsId.includes(r.id)
      }))
      return cb(null, { 
        restaurants: data, 
        categories, 
        categoryId,
        pagination: getPagination(limit, page, restaurants.count)
      })
    })
    .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
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
      return cb(null, { 
        restaurant: restaurant.toJSON(),
        isFavorited,
        isLiked
      })      
    })
    .catch(err => cb(err))
  },
  getTopRestaurants: (req, cb) => {
    return Restaurant.findAll({
      include: { model: User, as: 'FavoritedUsers' }
    })
      .then(restaurants => {
        const result = restaurants
          .map(r => ({
            ...r.toJSON(),
            favoritedCount: r.FavoritedUsers.length,
            isFavorited: req.user && req.user.FavoritedRestaurants.some(fr => fr.id === r.id),
            description: r.description ? r.description.substring(0, 50) : [] // 避免找不到 description
          }))
          .sort((a, b) => b.favoritedCount - a.favoritedCount)
          .slice(0, 10)
        return cb(null, { restaurants: result })
      })
      .catch(err => cb(err))
  },
  getFeeds: (req, cb) => {
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
        return cb(null, { restaurants, comments })
      })
      .catch(err => cb(err))
  },
  getDashboard: (req, cb) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category, 
        Comment
      ]
    })
      .then((restaurant) => {
        if(!restaurant) throw new Error('It does not exist:(')
        const rToJSON = restaurant.toJSON()

        return cb(null, { restaurant: rToJSON })
      })         
      .catch(err => cb(err))
  }      
}

module.exports = restaurantServices
