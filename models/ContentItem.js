const db = require('../database')

const ContentItem = {}

ContentItem.create = (newContentItem, result) => {
  db.query("INSERT INTO content_items SET ?", newContentItem, (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }
    console.log("created content item: ", { id: res.insertId, ...newContentItem })
    result(null, { id: res.insertId, ...newContentItem })
  })
}

ContentItem.findById = (contentItemId, result) => {
  db.query("SELECT * FROM content_items WHERE id = ?", contentItemId, (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }
    if (res.length) {
      console.log("found content item: ", res[0])
      result(null, res[0])
      return
    }
    result({ kind: "not_found" }, null)
  })
}

// Add other methods as needed

module.exports = ContentItem
