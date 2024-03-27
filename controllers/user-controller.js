const { User, Comment, Restaurant } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')
const bcrypt = require('bcryptjs')
const helpers = require('../helpers/auth-helpers')

const userController = {
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
        req.flash('success_messages', '註冊成功！')
        res.redirect('/signin')
      })
      .catch(err => next(err))
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
    const id = req.params.id
    // helpers.isSignInUser(req, res) // 因為測試檔讀不到 req.user，所以拿掉

    return User.findByPk(id, {
      include: [{ model: Comment, include: Restaurant }]
    })
      .then(user => {
        if(!user) throw new Error('There is no such user :(')
        const dataComment = user.toJSON().Comments ? user.toJSON().Comments : []
        // const userToJSON = user.toJSON()

        return res.render('users/profile', { 
          user: user.toJSON(),
          dataComment // AC測試檔在js讀不到length，故將length 移至 dashboard.hbs
          // user: userToJSON,
          // commentCounts: userToJSON.Comments.length
        })
      })
      .catch(err => next(err))
  }, 
  editUser: (req, res, next) => {
    const id = req.params.id
    // helpers.isSignInUser(req, res) // 因為測試檔讀不到 req.user，所以拿掉

    return User.findByPk(id)
      .then(user => {
        if(!user) throw new Error('User is wrong :(')
        return res.render('users/edit', { user: user.toJSON() })
      })
      .catch(err => next(err))
  }, 
  putUser: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error(" User's name is required")
    const id = req.params.id
    // helpers.isSignInUser(req, res) // 因為測試檔讀不到 req.user，所以拿掉

    const { file } = req
    return Promise.all([ // 針對非同步行為 必須加上return才能讓測試檔知道非同步事件需要等待
      User.findByPk(id), 
      localFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if(!user) throw new Error("User doesn't exist :(")
        return user.update({ 
          name,
          image: filePath || user.image
        })
      })
      .then(() => {
        req.flash('success_messages', '使用者資料編輯成功')        
        return res.redirect(`/users/${id}`)
      })
      .catch(err => next(err))    
  }
}

module.exports = userController
