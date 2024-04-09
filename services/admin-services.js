const { Restaurant, User, Category } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

const adminServices = {
  getRestaurants: (req, cb) => {
    Restaurant.findAll({
      raw: true,
      nest:true,
      include: [Category]
    })
      .then(restaurants =>  cb(null, { restaurants }))
      .catch(error => cb(error))
  },
  createRestaurants: (req, cb) => {
    return Category.findAll({
      raw: true
    })
      .then(categories =>  cb(null, { categories }))
      .catch(err => cb(err))
  },
  editRestaurant: (req, cb) => {
    // rest_id 被定義在 admin.js
    Promise.all([
      Restaurant.findByPk(req.params.rest_id, { raw: true }), 
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("The restaurant doesn't exist :(")
        cb(null, { restaurant, categories })
      })
      .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
    // rest_id 被定義在 admin.js
    Restaurant.findByPk(req.params.rest_id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("The restaurant doesn't exist :(")
        cb(null, { restaurant })
      })
      .catch(err => cb(err))
  },
  putRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')

    const { file } = req

    Promise.all([
      Restaurant.findByPk(req.params.rest_id),
      localFileHandler(file)
    ])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          categoryId,
          image: filePath || restaurant.image
        })
      })
      .then((putRestaurant) => {
        cb(null, putRestaurant)
      })
      .catch(err => cb(err))
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
  },
  getUsers: (req, cb) => {
    return User.findAll({
      raw: true
    })
      .then(users => {
        users.forEach(user => {
          if (user.isAdmin) {
            user.role = 'admin'
            user.authChange = 'set as user'
          } else {
            user.role = 'user'
            user.authChange = 'set as admin'
          }
        })
        return users
      })
      .then(users => cb(null, { users }))
      .catch(error => cb(error))
  },
  patchUser: (req, cb) => {
    const { id } = req.params // 取得 被點選到的id
    return User.findByPk(id, {
    })
      .then(user => {
        if (!user) throw new Error('user does not exist:(')
        if (user.email === 'root@example.com') throw new Error('禁止變更 root 權限:(')
        return user.update({ isAdmin: !user.isAdmin })
          .then(changeAuth => cb(null, changeAuth))
      })
      .catch(err => cb(err))
  }  
}

module.exports = adminServices
