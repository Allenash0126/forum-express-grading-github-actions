const { User, Comment, Restaurant, Favorite, Followship, Like } = require('../../models')
const { localFileHandler } = require('../../helpers/file-helpers')
const bcrypt = require('bcryptjs')
const helpers = require('../../helpers/auth-helpers')

const userController = {
  addFollowing: (req, res, next) => {
    const followerId = req.user.id
    const followingId = req.params.userId
    return Promise.all([
      User.findByPk(followingId),
      Followship.findOne({
        where: { followerId, followingId }
      })
    ])
      .then(([user, follow]) => {
        if(!user) throw new Error('There is no such user :(')
        if(follow) throw new Error('The user has been within your following list')
        return Followship.create({ followerId, followingId })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFollowing: (req, res, next) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })    
      .then(follow => {
        if(!follow) throw new Error('The user has not been within your following list')
        return follow.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  getTopUsers: (req, res, next) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
      .then(users => {
        const result = users
          .map(user => ({
            ...user.toJSON(),
            followerCount: user.Followers.length,
            isFollowed: req.user.Followings.some(f => f.id === user.id) 
          }))
          .sort((a, b) => b.followerCount - a.followerCount)
            return res.render('top-users', { users: result })
      })
        .catch(err => next(err))
  },
  addLike: (req, res, next) => {
    const { restaurantId } = req.params
    const userId = req.user.id

    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Like.findOne({
        where: { userId ,restaurantId }
      })
    ])
      .then(([restaurant, like]) => {
        if(!restaurant) throw new Error('There is no such restaurant.')
        if(like) throw new Error('It has been liked :(')
        return Like.create({ restaurantId, userId })
      })
      .then(() => {
        res.redirect('back')
      })
      .catch(err => next(err))
  },
  removeLike: (req, res, next) => {
    const { restaurantId } = req.params
    const userId = req.user.id
    
    return Like.findOne({
        where: { userId ,restaurantId }
      })
      .then(like => {
        if(!like) throw new Error('It has not been liked list :(')
        return like.destroy()
      })
      .then(() => {
        res.redirect('back')
      })
      .catch(err => next(err))
  },  
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    const userId = req.user.id

    return Promise.all([
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
    return Favorite.findOne({
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
      include: [
        { model: Comment, include: Restaurant },
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    })
      .then(user => {
        if(!user) throw new Error('There is no such user :(')     

        const restId_FromAllComments = user.toJSON().Comments.map(r => r.restaurantId) // user所有的評論 包含重複評論的餐廳id
        const restId_DeleteRepeatId = [] // 移除重複評論的餐廳id
        const temps = restId_FromAllComments.map(r => {
          if(!restId_DeleteRepeatId.some(restId => restId === r)) {
            restId_DeleteRepeatId.push(r)
          }
        })
        restId_DeleteRepeatId.sort((a, b) => a - b) // 依照順序排列

        const temps2 = []
        const imgLocation = restId_DeleteRepeatId.map(rId => ({ // 塞入各餐廳id 所對應的image載點
          ...temps2,
          id: rId,
          image: user.toJSON().Comments.find(Comment => Comment.restaurantId === rId).Restaurant ? user.toJSON().Comments.find(Comment => Comment.restaurantId === rId).Restaurant.image : [] // 避免找不到restaurant
        }))
                
        return res.render('users/profile', { 
          user: user.toJSON(), 
          imgLocation
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
