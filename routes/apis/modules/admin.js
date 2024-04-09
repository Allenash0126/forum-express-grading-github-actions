const express = require('express')
const router = express.Router()
const adminController = require('../../../controllers/apis/admin-controller')
const categoryController = require('../../../controllers/apis/category-controller')
const upload = require('../../../middleware/multer')

router.get('/restaurants/create', adminController.createRestaurants)
router.get('/restaurants/:rest_id/edit', adminController.editRestaurant)
router.get('/restaurants/:rest_id', adminController.getRestaurant)
router.put('/restaurants/:rest_id', upload.single('image'), adminController.putRestaurant)
router.delete('/restaurants/:rest_id', adminController.deleteRestaurant)
router.get('/restaurants', adminController.getRestaurants)
router.patch('/users/:id', adminController.patchUser)
router.get('/users', adminController.getUsers)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)

module.exports = router
