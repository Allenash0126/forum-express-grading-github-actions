const { Restaurant, Category, User, Comment } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantsController = {
  getTopRestaurants: (req, res, next) => {
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
        return res.render('top-restaurants', { restaurants: result })
      })
      .catch(err => next(err))
  },
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
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
