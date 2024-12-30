const db = require('../database')

const User = {}

User.create = (newUser, result) => {
  db.query("INSERT INTO users SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }
    console.log("created user: ", { id: res.insertId, ...newUser })
    result(null, { id: res.insertId, ...newUser })
  })
}

User.findByEmail = (email, result) => {
  db.query("SELECT * FROM users WHERE email = ?", email, (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }
    if (res.length) {
      console.log("found user: ", res[0])
      result(null, res[0])
      return
    }
    // not found User with the email
    result({ kind: "not_found" }, null)
  })
}

// Add other methods as needed

module.exports = User
