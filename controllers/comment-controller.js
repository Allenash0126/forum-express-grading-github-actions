const { Comment, Restaurant, User } = require('../models')

const commentController = {
  postComment: (req, res, next) => {
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

        Comment.create({ text, restaurantId, userId })
      })
      .then(() => {
        req.flash('success_messages', '發表評論成功！')
        res.redirect(`/restaurants/${restaurantId}`)
      })
      .catch(err => next(err))
  }
}

module.exports = commentController