const pool = require('../database')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mailer = require('../utils/mailer')

const AuthenticationController = {
    createUser: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password, campaign_name, from } = req.body

        try {
            // Check if user exists
            const [existingUser] = await pool.query('SELECT * FROM Users WHERE email = ?', [email])
            if (existingUser.length > 0) {
                return res.status(409).json({ message: 'The email address is already in use. Please log in or use a different email address.' })
            }

            const verification_token = crypto.randomBytes(20).toString('hex')
            let passwordHash = null
            let token = null

            if (password) {
                const salt = await bcrypt.genSalt(10)
                passwordHash = await bcrypt.hash(password, salt)
            } else {
                token = crypto.randomBytes(30).toString('hex')
            }

            // Insert new user
            const [userResult] = await pool.query(
                'INSERT INTO Users (email, password, campaign_name, from_site, verification_token, token) VALUES (?, ?, ?, ?, ?, ?)',
                [email, passwordHash, campaign_name, from === 'onhubplay' ? 'OneHubPlay' : null, verification_token, token]
            )
            const userId = userResult.insertId

            // Create default settings for the user
            await pool.query('INSERT INTO UserSettings (user_id, email_notification) VALUES (?, ?)', [userId, true])

            // Get the first plan subscription (or create a default one if none exists)
            const [existingPlan] = await pool.query('SELECT * FROM PlanSubscriptions LIMIT 1')
            let plan
            if (existingPlan.length === 0) {
                const [newPlanResult] = await pool.query('INSERT INTO PlanSubscriptions (currentPlan) VALUES (?)', [0])
                plan = { id: newPlanResult.insertId, currentPlan: 0 }
            } else {
                plan = existingPlan[0]
            }

            let toPay = 0
            if (plan.currentPlan < 3) {
                toPay = plan.currentPlan + 1
            } else if (plan.currentPlan === 3) {
                toPay = 1
            }

            // Send verification email
            const verificationLink = `/* TODO: Construct verification URL */` // Placeholder
            mailer.sendVerificationEmail(email, verificationLink)

            // Fetch the newly created user
            const [newUser] = await pool.query('SELECT * FROM Users WHERE id = ?', [userId])

            res.status(201).json({
                user: newUser[0],
                isLogin: false,
                toPay,
                isTrial: true, // Assuming default is true
                is_primeplay: false,
            })
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: 'An error occurred', error: err.message })
        }
    },

    createAdmin: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body

        try {
            let user = await User.findOne({ email })
            if (user) {
                return res.status(400).json({ message: 'Admin with this email already exists' })
            }

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            user = new User({
                email,
                password: hashedPassword,
                type: 'admin',
                verification_token: crypto.randomBytes(20).toString('hex'),
            })

            await user.save()

            // Consider sending a verification email here

            res.status(201).json({
                user,
                isLogin: false,
            })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    login: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body

        try {
            const user = await User.findOne({ email })
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' })
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' })
            }

            const token = jwt.sign({ userId: user.id }, 'secretKey', { // TODO: Replace with actual secret
                expiresIn: '1h',
            })

            res.json({
                token,
                user,
                isLogin: user.invoice_id && user.is_subscribed,
            })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    adminLogin: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body

        try {
            const user = await User.findOne({ email, type: 'admin' })
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' })
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' })
            }

            const token = jwt.sign({ userId: user.id }, 'adminSecretKey', { // TODO: Replace with actual secret
                expiresIn: '1h',
            })

            res.json({
                token,
                user,
            })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    subscriptionDetails: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { user_id, first_name, last_name, exp_date_m, exp_date_y, card_number, cvv } = req.body

        try {
            const card = new Card({
                user_id,
                first_name,
                last_name,
                exp_date_m,
                exp_date_y,
                card_number,
                cvv,
            })
            await card.save()

            const user = await User.findById(user_id)
            if (user.from === 'Slot_Game_1') {
                let wallet = await GameWallet.findOne({ user_id: user.id })
                if (wallet) {
                    wallet.balance += 100
                } else {
                    wallet = new GameWallet({
                        user_id: user.id,
                        balance: 100,
                    })
                }
                await wallet.save()
            }

            res.status(201).json({ card })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    createPassword: async (req, res) => {
        try {
            const user = await User.findOne({ token: req.params.token })
            if (!user) {
                return res.status(404).json({ message: 'Invalid token' })
            }
            res.json({ token: req.params.token, email: user.email })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    storePassword: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const user = await User.findOne({ token: req.params.token })
            if (!user) {
                return res.status(404).json({ message: 'Invalid token' })
            }

            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(req.body.password, salt)
            user.token = null
            await user.save()

            const token = jwt.sign({ userId: user.id }, 'secretKey', { // TODO: Replace with actual secret
                expiresIn: '1h',
            })

            res.json({
                token,
                user,
                isLogin: user.invoice_id && user.is_subscribed,
            })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    logout: async (req, res) => {
        try {
            // Assuming you are using JWT, client-side should discard the token
            res.json({ message: 'User Logged Out' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    verify: async (req, res) => {
        try {
            const user = await User.findOne({ verification_token: req.params.token })
            if (!user) {
                return res.status(404).json({ message: 'Account with verification Token does not exist' })
            }

            if (!user.verified) {
                user.verified = true
                user.verification_token = null
                await user.save()

                if (user.from === 'Slot_Game_1') {
                    let wallet = await GameWallet.findOne({ user_id: user.id })
                    if (wallet) {
                        wallet.balance += 100
                    } else {
                        wallet = new GameWallet({
                            user_id: user.id,
                            balance: 100,
                        })
                    }
                    await wallet.save()
                }

                const token = jwt.sign({ userId: user.id }, 'secretKey', { // TODO: Replace with actual secret
                    expiresIn: '1h',
                })

                return res.json({
                    user,
                    token,
                    isLogin: user.invoice_id && user.is_subscribed,
                    message: 'Your account has been verified.',
                })
            }

            const token = jwt.sign({ userId: user.id }, 'secretKey', { // TODO: Replace with actual secret
                expiresIn: '1h',
            })

            res.json({
                user,
                token,
                isLogin: user.invoice_id && user.is_subscribed,
                message: 'Your account is already verified.',
            })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    resetPassword: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const user = await User.findById(req.user.id) // Assuming middleware adds user to req
            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }

            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(req.body.password, salt)
            await user.save()

            res.json({ message: 'Password reset successfully' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    getCustomers: async (req, res) => {
        try {
            const users = await User.find().populate('card').sort({ createdAt: -1 })
            const mergedData = users.map(user => ({
                id: user.id,
                email: user.email,
                created_at: user.createdAt,
                has_card: !!user.card,
                has_subscribed: !!user.invoice_id,
                first_name: user.card?.first_name || '',
                last_name: user.card?.last_name || '',
                exp_date_m: user.card?.exp_date_m || '',
                exp_date_y: user.card?.exp_date_y || '',
                card_number: user.card?.card_number || '',
                amount: user.card?.amount || '',
                country: user.card?.country || '',
                city: user.card?.city || '',
                zipcode: user.card?.zipcode || '',
                timezone: user.card?.timezone || '',
                invoice_id: user.invoice_id,
                is_subscribed: user.is_subscribed,
                on_trial: user.trial_status,
                campaign_name: user.campaign_name,
            }))
            res.json(mergedData)
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    getUsers: async (req, res) => {
        try {
            const users = await User.find({ type: 'admin' })
            res.json(users)
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    changePassword: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const salt = await bcrypt.genSalt(10)
            const newPassword = await bcrypt.hash(req.body.password, salt)

            const user = await User.findByIdAndUpdate(req.user.id, { password: newPassword }, { new: true })
            res.json(user)
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    uploadAvatar: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const user = await User.findByIdAndUpdate(req.user.id, { avatar: req.body.avatar_url }, { new: true })
            res.json({ user })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error', error: err.message })
        }
    },

    PromotionRegistration: async (req, res) => {
        try {
            const plan = await PlanSubscription.findOne()
            if (plan && plan.redirect_to_primeplay) {
                // Logic for Primeplay registration
                const record = new PrimeplayRecords({
                    pub_id: req.body.pub_id,
                    email: req.body.email,
                    registered: false,
                    camapaign_name: req.body.camapaign_name,
                })
                await record.save()

                plan.redirect_to_primeplay = false
                await plan.save()
                return res.json({ message: 'Prime Play Record created successfully.', is_primeplay: true })
            } else {
                // Existing user creation logic
                const userResponse = await AuthenticationController.createUser(req, res)
                plan.redirect_to_primeplay = true
                await plan.save()
                return userResponse
            }
        } catch (error) {
            console.error(error)
            return res.status(500).json({ message: 'An error occurred', error: error.message })
        }
    }
}

module.exports = AuthenticationController
