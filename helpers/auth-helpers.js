const getUser = req => {
  return req.user || null
}

const ensureAuthenticated = req => {
  return req.isAuthenticated()
}

const isSignInUser = (req, res) => {  
  const id = req.params.id
  const idSignIn = req.user.id.toString()
  if (idSignIn !== id) {
    req.flash('error_messages', "User can't edit other's profile")
    return res.redirect(`/users/${idSignIn}`)
  }  
}

module.exports = {
  getUser,
  ensureAuthenticated,
  isSignInUser
}
