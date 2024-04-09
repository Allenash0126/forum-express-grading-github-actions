const passport = require('../config/passport')
// const authenticated = passport.authenticate('jwt', { session: false })
const authenticated = (req, res, next) => { // 為了讓前端收到完整的錯誤資訊 所以使用cb，將上述改成以下
  passport.authenticate('jwt', { session: false }, (err, user) => { // 這個 user，已經是passport 在config帶入的 user data了 
    if (err || !user) return res.status(401).json({ status: 'error', message: 'unauthorized' })
    req.user = user // 為了讓 authenticatedAdmin 可帶入 req.user，所以先在這裡變數換名字
    next()
  })(req, res, next)
}

const authenticatedAdmin = (req, res, next) => {
  if(req.user && req.user.isAdmin) return next()
  return res.status(403).json({ status: 'error', message: 'permission is denied' })
}

module.exports = {
  authenticated,
  authenticatedAdmin
}
