const adminServices = require('../../services/admin-services')

const adminController = {
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('admin/restaurants', data))    
  },
  createRestaurants: (req, res, next) => {
    return Category.findAll({
      raw: true
    })
      .then((categories) => {
        res.render('admin/create-restaurant', { categories })
      })
      .catch((err) => next(err))
  },
  postRestaurant: (req, res, next) => {
    adminServices.postRestaurant(req, (err, data) => {
      if(err) return next(err)
      req.flash('success_messages', '新增成功:)')
      req.session.createdData = data
      return res.redirect('admin/restaurants')
    })
  },
  getRestaurant: (req, res, next) => {
    // rest_id 被定義在 admin.js
    Restaurant.findByPk(req.params.rest_id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("The restaurant doesn't exist :(")
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    // rest_id 被定義在 admin.js
    Promise.all([
      Restaurant.findByPk(req.params.rest_id, { raw: true }), 
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("The restaurant doesn't exist :(")
        res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
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
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully to update')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
    deleteRestaurant: (req, res, next) => {
      adminServices.deleteRestaurant(req, (err, data) => {
        if (err) return next(err)
        req.session.deletedData = data
        req.flash('success_messages', '刪除成功:)')
        return res.redirect('/admin/restaurants')      
    })    
  },
  getUsers: (req, res, next) => {
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
      .then(users => res.render('admin/users', { users }))
      .catch(error => next(error))
  },
  patchUser: (req, res, next) => {
    const { id } = req.params // 取得 被點選到的id
    return User.findByPk(id, {
    })
      .then(user => {
        if (!user) throw new Error('user does not exist:(')
        if (user.email === 'root@example.com') {
          req.flash('error_messages', '禁止變更 root 權限')
          return res.redirect('back')
        }
        return user.update({ isAdmin: !user.isAdmin })
          .then(() => {
            req.flash('success_messages', '使用者權限變更成功')
            return res.redirect('/admin/users')
          })
      })
      .catch(err => next(err))
  }
}

module.exports = adminController
