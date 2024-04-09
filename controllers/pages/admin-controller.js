const adminServices = require('../../services/admin-services')

const adminController = {
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('admin/restaurants', data))    
  },
  createRestaurants: (req, res, next) => {
    adminServices.createRestaurants(req, (err, data) => err ? next(err) : res.render('admin/create-restaurant', data))
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
    adminServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('admin/restaurant', data))    
  },
  editRestaurant: (req, res, next) => {
    adminServices.editRestaurant(req, (err, data) => err ? next(err) : res.render('admin/edit-restaurant', data))    
  },
  putRestaurant: (req, res, next) => {
    adminServices.putRestaurant(req, (err, data) => {
      if (err) return next(err)
        req.flash('success_messages', 'restaurant was successfully to update')
        req.session.putRestaurant = data
        return res.redirect('/admin/restaurants')      
    })
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
    adminServices.getUsers(req, (err, data) => err ? next(err) : res.render('admin/users', data))  
  },
  patchUser: (req, res, next) => {
    adminServices.patchUser(req, (err, data) => {
      // console.log('data~~~~~~~~~', data)
      // console.log('err~~~~~~~~~', err)

      if (err) return next(err)
      req.session.changeAuthData = data
      req.flash('success_messages', '使用者權限變更成功')
      return res.redirect('/admin/users')   
      // return next(err)   
    })
  }
}

module.exports = adminController
