const { Comment, Restaurant, User } = require('../../models')
const commentServices = require('../../services/comment-services')

const commentController = {
  postComment: (req, res, next) => {
    commentServices.postComment(req, (err, data) => {
      const { restaurantId } = req.body
      if(err) return next(err)
      req.flash('success_messages', '發表評論成功！')
      res.redirect(`/restaurants/${restaurantId}`)
    })   
  },
  deleteComment: (req, res, next) => {
    commentServices.deleteComment(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '刪除成功！')
      return res.redirect(`/restaurants/${req.params.id}`)
    })    
  }
}

module.exports = commentController