const { Restaurant, Category } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')

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
      const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) :[]
      const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []
      const data = restaurants.rows.map(r => ({
        ...r,
        description: r.description.substring(0, 50),
        isFavorited: favoritedRestaurantsId.includes(r.id),
        isLiked: likedRestaurantsId.includes(r.id)
      }))
      return res.json({ 
        restaurants: data, 
        categories, 
        categoryId,
        pagination: getPagination(limit, page, restaurants.count)
      })
    })
  }
}
module.exports = restaurantsController