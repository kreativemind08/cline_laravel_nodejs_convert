const UserSetting = require('../models/UserSetting')

const UserSettingController = {
    unsubscribeNotification: async (req, res) => {
        const { id } = req.params
        try {
            let setting = await UserSetting.findOne({ user_id: id })
            if (!setting) {
                setting = new UserSetting({ user_id: id })
            }
            setting.email_notification = false
            await setting.save()
            res.status(200).json({ message: 'Email Notification Cancelled Successfully' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error: error.message })
        }
    },
}

module.exports = UserSettingController
