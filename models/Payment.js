const db = require('../database')

const Payment = {}

Payment.create = (newPayment, result) => {
  db.query("INSERT INTO payments SET ?", newPayment, (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }
    console.log("created payment: ", { id: res.insertId, ...newPayment })
    result(null, { id: res.insertId, ...newPayment })
  })
}

Payment.findById = (paymentId, result) => {
  db.query("SELECT * FROM payments WHERE id = ?", paymentId, (err, res) => {
    if (err) {
      console.log("error: ", err)
      result(err, null)
      return
    }
    if (res.length) {
      console.log("found payment: ", res[0])
      result(null, res[0])
      return
    }
    // not found Payment with the id
    result({ kind: "not_found" }, null)
  })
}

// Add other methods as needed

module.exports = Payment
