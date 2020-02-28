const express = require('express');
const router = express.Router();
const { authLocal, authJwt, authFacebook, authGoogle } = require('../middleware/authMiddleware')
const passport = require('passport')
const { body } = require('express-validator/check')

const authContoller = require('../controllers/authController')

router.post('/signup', authContoller.postRegister)
router.post('/signin',  authLocal, authContoller.postLogin)
router.get('/facebook', authFacebook)
router.get('/facebook/callback', authFacebook, authContoller.facebookLogin)

router.get('/google', authGoogle)
router.get('/google/callback', authGoogle, authContoller.googleLogin)

router.get('/profile/:_id',  authJwt ,  authContoller.Profile);

module.exports = router

// [body('email', 'incorrect email format').isEmail().normalizeEmail(), body('password', 'incorrect password').trim()] 