const User = require('../models/User')
const { validationResult } = require('express-validator')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const mailer = require('../utils/mailer')

const ForgotPasswordController = {
    forgot: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email } = req.body

        try {
            const user = await User.findOne({ email })
            if (!user) {
                return res.status(404).json({ message: "You don't have an account" })
            }

            const resetToken = crypto.randomBytes(20).toString('hex')
            user.resetPasswordToken = resetToken
            user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
            await user.save()

            const resetLink = `/* TODO: Construct reset password URL */${resetToken}` // Placeholder
            mailer.sendResetPasswordEmail(user.email, resetLink)

            res.status(200).json({ message: 'Reset password link sent to your email.' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    reset: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { token, email, password } = req.body

        try {
            const user = await User.findOne({
                email,
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() },
            })

            if (!user) {
                return res.status(400).json({ message: 'Invalid password reset token.' })
            }

            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
            user.resetPasswordToken = undefined
            user.resetPasswordExpires = undefined
            await user.save()

            res.status(200).json({ message: 'Password reset successfully.' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },
}

module.exports = ForgotPasswordController
