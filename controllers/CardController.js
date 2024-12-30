const Card = require('../models/Card')

exports.getUserCard = async (req, res) => {
    try {
        const user = req.user
        const card = await Card.findOne({ user_id: user.id })
        res.status(200).json({ success: true, data: { card } })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}
