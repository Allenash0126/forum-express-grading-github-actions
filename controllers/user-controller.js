const db = require('../models')
const { User } = db
const { Restaurant, Favorite } = require('../models')
const bcrypt = require('bcryptjs')

const userController = {
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    const userId = req.user.id

    Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: { userId, restaurantId }
      }) 
    ])
      .then(([restaurant, favorite]) => {
        if(!restaurant) throw new Error(' There is no such restaurant :( ')
        if(favorite) throw new Error(' The restaurant has been within favorited list. ')
        return Favorite.create({ userId, restaurantId })
      })
      .then(() => {
        res.redirect('back')
      })
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    const userId = req.user.id
    Favorite.findOne({
      where: { userId, restaurantId }
    }) 
      .then(favorite => {
        if(!favorite) throw new Error(' There is no such restaurant within favorited list. ')
        return favorite.destroy()
      }) 
      .then(() => {
        res.redirect('back')
      })
      .catch(err => next(err))      
  },  
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    const { name, email, password, passwordCheck } = req.body
    if (password !== passwordCheck) throw new Error(' Passwords do not match')
    User.findOne({
      where: { email }
    })
      .then(user => {
        if (user) throw new Error(' Email already exists!')
        return bcrypt.hash(password, 10)
      })

      .then(hash => User.create({ name, email, password: hash }))
      .then(() => {
        req.flash('success', '註冊成功！')
        res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success', '登出成功！')
    req.logout()
    res.redirect('/signin')
  }
}

module.exports = userController
