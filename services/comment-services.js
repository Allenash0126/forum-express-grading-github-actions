const { Restaurant, User, Comment } = require('../models')

const commentServices = {
  postComment: (req, cb) => {
    const { text, restaurantId } = req.body
    const userId = req.user.id

    if(!text) throw new Error(' The content is required!')
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      User.findByPk(userId)
    ])
      .then(([restaurant, user]) => {
        if(!restaurant) throw new Error('The restaurant does not exist :(')
        if(!user) throw new Error('The user does not exist :(')   

        return Comment.create({ text, restaurantId, userId })
      })
      .then(comment => cb(null, comment))
      .catch(err => cb(err))
  },
  deleteComment: (req, cb) => {
    return Comment.findByPk(req.params.id)
      .then(comment => {
        if(!comment) throw new Error('There is no comment!')
        return comment.destroy()
      })
      .then((deletedComment) => {
        req.flash('success_messages', '刪除成功！')
        return cb(null, deletedComment)
      })
      .catch(err => cb(err))
  }  
}


module.exports = commentServices