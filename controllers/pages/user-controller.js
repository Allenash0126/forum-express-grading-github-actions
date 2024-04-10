const { User, Comment, Restaurant, Favorite, Followship, Like } = require('../../models')
const { localFileHandler } = require('../../helpers/file-helpers')
const bcrypt = require('bcryptjs')
const helpers = require('../../helpers/auth-helpers')
const userServices = require('../../services/user-services')

const userController = {
  addFollowing: (req, res, next) => {
    userServices.addFollowing(req, (err, data) => err ? next(err) : res.redirect('back', data))    
  },
  removeFollowing: (req, res, next) => {
    userServices.removeFollowing(req, (err, data) => err ? next(err) : res.redirect('back', data))       
  },
  getTopUsers: (req, res, next) => {
    userServices.getTopUsers(req, (err, data) => err ? next(err) : res.render('top-users', data))
  },
  addLike: (req, res, next) => {
    userServices.addLike(req, (err, data) => err ? next(err) : res.redirect('back', data)) 
  },
  removeLike: (req, res, next) => {
    userServices.removeLike(req, (err, data) => err ? next(err) : res.redirect('back', data)) 
  },  
  addFavorite: (req, res, next) => {
    userServices.addFavorite(req, (err, data) => err ? next(err) : res.redirect('back', data))     
  },
  removeFavorite: (req, res, next) => {
    userServices.removeFavorite(req, (err, data) => err ? next(err) : res.redirect('back', data))      
  },  
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => {
      if (err) return next(err)
      req.session.userCreated = data
      req.flash('success_messages', '註冊成功！')
      return res.redirect('/signin')
    })
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    userServices.getTopUsers(req, (err, data) => err ? next(err) : res.render('users/profile', data))
  }, 
  editUser: (req, res, next) => {
    userServices.getTopUsers(req, (err, data) => err ? next(err) : res.render('users/edit', data))
  }, 
  putUser: (req, res, next) => {
    const id = req.params.id 

    userServices.putUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '使用者資料編輯成功!')
      return res.redirect(`/users/${id}`)
    })
  }

}

module.exports = userController
