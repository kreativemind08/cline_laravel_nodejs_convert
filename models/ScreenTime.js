const db = require('../database') // Assuming database.js handles the connection

const ScreenTime = {}

ScreenTime.create = (newScreenTime, result) => {
  db.query("INSERT INTO screen_times SET ?", newScreenTime, (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }
    console.log("created screen_time: ", { id: res.insertId, ...newScreenTime })
    result(null, { id: res.insertId, ...newScreenTime })
  })
}

// Add other methods like findById, getAll, updateById, remove if needed

module.exports = ScreenTime
