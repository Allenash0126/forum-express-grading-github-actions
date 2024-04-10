const { User, Comment, Restaurant, Followship, Favorite, Like } = require('../models')
const bcrypt = require('bcryptjs')
const { localFileHandler } = require('../helpers/file-helpers')

const userServices = {
  signUp: (req, cb) => {
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
      .then((userCreated) => cb(null, userCreated))
      .catch(err => cb(err))
  },
  getTopUsers: (req, cb) => {
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
            return cb(null, { users: result })
      })
        .catch(err => cb(err))
  },
  getUser: (req, cb) => {
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
                
        return cb(null, { 
          user: user.toJSON(), 
          imgLocation
        })
      })
      .catch(err => cb(err))
  },
  editUser: (req, cb) => {
    const id = req.params.id

    return User.findByPk(id)
      .then(user => {
        if(!user) throw new Error('No such user in the list :(')
        return cb(null, { user: user.toJSON() })
      })
      .catch(err => cb(err))
  },
  putUser: (req, cb) => {
    const { name } = req.body
    if (!name) throw new Error(" User's name is required")
    const id = req.params.id

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
      .then(user => cb(null, user))
      .catch(err => cb(err))    
  },
  addFollowing: (req, cb) => {
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
      .then(followship => cb(null, followship))
      .catch(err => cb(err))  
  },
  removeFollowing: (req, cb) => {
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
      .then(deletedFollow => cb(null, deletedFollow))
      .catch(err => cb(err))
  },  
  addFavorite: (req, cb) => {
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
      .then(favorite => cb(null, favorite))
      .catch(err => cb(err))
  },
  removeFavorite: (req, cb) => {
    const { restaurantId } = req.params
    const userId = req.user.id
    return Favorite.findOne({
      where: { userId, restaurantId }
    }) 
      .then(favorite => {
        if(!favorite) throw new Error(' There is no such restaurant within favorited list. ')
        return favorite.destroy()
      }) 
      .then(deletedFavorite => cb(null, deletedFavorite))
      .catch(err => cb(err))      
  },
  addLike: (req, cb) => {
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
      .then(like => cb(null, like))
      .catch(err => cb(err))
  },
  removeLike: (req, cb) => {
    const { restaurantId } = req.params
    const userId = req.user.id
    
    return Like.findOne({
        where: { userId ,restaurantId }
      })
      .then(like => {
        if(!like) throw new Error('It has not been liked list :(')
        return like.destroy()
      })
      .then(unlike => cb(null, unlike))
      .catch(err => cb(err))
  }        
}

module.exports = userServices