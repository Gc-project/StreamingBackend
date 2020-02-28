const appconfig = require('../app_setting.json')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var formidable = require('formidable');

const User = require('../models/authmodel/user');

const passport = require('passport');
const passportJwt = require('passport-jwt');

const jwtStrategy = passportJwt.Strategy
const localStrategy = require('passport-local').Strategy
const facebookStrategy = require('passport-facebook').Strategy
const googleStrategy = require('passport-google-oauth').OAuthStrategy
const ExtractJwt = passportJwt.ExtractJwt


passport.use(new localStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email }).populate('createdChannel').populate('subscriptions.channelId')
        if (!user) {
            const error = new Error('user with this email is not found');
            return done(null, false);
        }

        bcrypt.compare(password, user.password).then(ismatched => {
            if (!ismatched) {
                const error = new Error('cannot decrypt the password');
                return done(null, false)
            }
            else{
                return done(null, user)
            }

        })
       
    } catch (error) {
        return done(error, false);
    }
}))


passport.use(new googleStrategy(
    {
        consumerKey: appconfig.google_key.appid,
        consumerSecret: appconfig.google_key.appsecret,
        callbackURL: appconfig.google_key.callbackurl

    }
    , (token, secretToken, profile, done) => {
        console.log(profile);
        console.log(token);
        return done(null, profile)
    }
))



passport.use(new facebookStrategy(
    {
        clientID: appconfig.facebook_key.appid,
        clientSecret: appconfig.facebook_key.appsecret,
        callbackURL: appconfig.facebook_key.callbackurl
    }, (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        console.log(accessToken);
        return done(null, profile);
    }))




passport.use(new jwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: appconfig.jwtsecretkey,

}, (jwtPayload, callback) => {
    if (!jwtPayload) {
        console.log('payload note found', jwtPayload)
        return callback(null, false)
    }
    // console.log('payload ' , jwtPayload)
    return callback(null, jwtPayload)
}))



isChannelCreatedByCurrentUser = (req, res, next) => {
    const currentUser = req.user;
    if (!currentUser) {
        next(new Error('Un authorized'));
    }
    User.findById(req.user.id).then(result => {
        console.log(currentUser.createdChannel.indexOf(req.body.channelId))
        if (currentUser.createdChannel.indexOf(req.body.channelId) >= 0) {
            next();
        } else {
            next(new Error('Un authorized access .... not your channel'));
        }

    }).catch(error => {
        next(new Error('Un authorized user not found'));
    })



}

exports.isChannelCreator = isChannelCreatedByCurrentUser;
exports.authLocal = passport.authenticate('local', { session: false })
exports.authJwt = passport.authenticate('jwt', { session: false })

exports.authFacebook = passport.authenticate('facebook');
exports.authGoogle = passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile'] });






