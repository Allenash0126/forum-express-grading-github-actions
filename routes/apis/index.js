const express = require('express')
const router = express.Router()

const passport = require('../../config/passport')
const userController = require('../../controllers/apis/user-controller')
const commentController = require('../../controllers/apis/comment-controller')
const restController = require('../../controllers/apis/restaurant-controller')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')
const { apiErrorHandler } = require('../../middleware/error-handler')
const admin = require('./modules/admin')
const upload = require('../../middleware/multer')

router.use('/admin', authenticated, authenticatedAdmin, admin)
// router.get('/signup', userController.signUpPage) // 就只是 render signUp.hbs，未提供資料，故不寫 api
router.post('/signup', userController.signUp)
// router.get('/signin', userController.signInPage) // 如上，就只是 render signIn.hbs，未提供資料，故不寫 api
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
// router.get('/logout', userController.logout) // http 是 stateless(無狀態)，不提供token就等於未登入，故不寫 api
router.get('/restaurants/top', authenticated, restController.getTopRestaurants)
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants', authenticated, restController.getRestaurants)
router.delete('/comments/:id', authenticated, commentController.deleteComment)
router.post('/comments', authenticated, commentController.postComment)

router.get('/users/top', authenticated, userController.getTopUsers)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)
router.use('/', apiErrorHandler)

module.exports = router