const ScreenTime = require('../models/ScreenTime')
const PageVisit = require('../models/PageVisit')
const PrimeplayRecords = require('../models/PrimeplayRecords')
const PlanSubscription = require('../models/PlanSubscription')
const PromoPageMetric = require('../models/PromoPageMetric')
const MusicVisit = require('../models/MusicVisit')
const MusicPlayTime = require('../models/MusicPlayTime')
const GameVisit = require('../models/GameVisit')
const GameDetailView = require('../models/GameDetailView')
const GamePlayTime = require('../models/GamePlayTime')
const SlotGameVisitMetric = require('../models/SlotGameVisitMetric')
const User = require('../models/User')
const DailyFreeSpinUsage = require('../models/DailyFreeSpinUsage')
const GameWallet = require('../models/GameWallet')

const promoPageIds = ["Lp1", "Register", "Subscribe_9_99", "Subscribe_19_99", "Subscribe_29_99", "Subscribe_39_95"]

exports.trackLogin = async (req, res) => {
    // No need to create LoginHistory record as it might be handled by authentication middleware
    res.status(200).json({ success: true, message: 'Data has been saved successfully' })
}

exports.trackScreenTime = async (req, res) => {
    try {
        const screenTime = new ScreenTime({
            user_id: req.user.id,
            screen_name: req.body.screen_name,
            start_time: new Date()
        })
        await screenTime.save()
        res.status(200).json({ screen_time_id: screenTime._id })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}

exports.updateScreenTime = async (req, res) => {
    try {
        const screenTime = await ScreenTime.findById(req.body.screen_time_id)
        if (screenTime) {
            screenTime.end_time = new Date()
            await screenTime.save()
            res.status(200).json({ success: true, message: 'Screen time updated successfully' })
        } else {
            res.status(404).json({ success: false, message: 'Screen time record not found' })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}

exports.trackPageVisit = async (req, res) => {
    try {
        await PageVisit.create({
            user_id: req.user.id,
            page_name: req.body.page_name,
            visited_at: new Date()
        })
        res.status(200).json({ success: true, message: 'Page visit tracked successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}

exports.getUserLoginHistory = async (req, res) => {
    try {
        const logins = await LoginHistory.find({ user_id: req.params.id })
            .select('id user_id updated_at createdAt')
            .sort({ updatedAt: -1 })
        res.status(200).json({ success: true, data: { logins } })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}

exports.getUserVisits = async (req, res) => {
    try {
        const screenTime = await ScreenTime.find({ user_id: req.params.id })
            .sort({ createdAt: -1 })
        res.status(200).json({ success: true, data: { screenTime } })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}

const { sequelize } = require('../database');

exports.trackLp1 = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        let plans = await PlanSubscription.findOneAndUpdate({}, { $inc: { track_lp1: 1 } }, { upsert: true, new: true, transaction: t });
        await PromoPageMetric.create([{
            ip_address: req.ip,
            promo_page_id: "Lp1",
            campaign_name: req.body.campaign_name,
            visit: 1
        }], { transaction: t });
        await t.commit();
        res.status(200).json({ success: true });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
}

exports.trackRegister = async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        let plans = await PlanSubscription.findOneAndUpdate({}, { $inc: { register: 1 } }, { upsert: true, new: true, session })
        await PromoPageMetric.create([{
            ip_address: req.ip,
            promo_page_id: "Register",
            campaign_name: req.body.campaign_name,
            visit: 1
        }], { session })
        await session.commitTransaction()
        res.status(200).json({ success: true })
    } catch (error) {
        await session.abortTransaction()
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    } finally {
        session.endSession()
    }
}

exports.trackSlotGame1 = async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        await SlotGameVisitMetric.create([{
            ip_address: req.ip,
            promo_page_id: "SLOT_GAME_1",
            campaign_name: req.body.campaign_name,
            visit: 1
        }], { session })

        if (req.body.dailys) {
            await SlotGameVisitMetric.create([{
                ip_address: req.ip,
                promo_page_id: `DAILY_EMAIL_${req.body.dailys}`,
                campaign_name: req.body.campaign_name,
                visit: 1
            }], { session })

            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            const existingUsage = await DailyFreeSpinUsage.findOne({
                user_id: req.user.id,
                created_at: { $gte: today, $lt: tomorrow }
            }, { session })

            if (!existingUsage && req.user.id) {
                await GameWallet.findOneAndUpdate(
                    { user_id: req.user.id },
                    { $inc: { balance: 100 } },
                    { upsert: true, new: true, session }
                )
                await DailyFreeSpinUsage.create([{
                    user_id: req.user.id,
                    free_spins: req.body.dailys
                }], { session })
            }
        }

        await session.commitTransaction()
        res.status(200).json({ success: true })
    } catch (error) {
        await session.abortTransaction()
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    } finally {
        session.endSession()
    }
}

exports.trackSlotGame1Registration = async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        await SlotGameVisitMetric.create([{
            ip_address: req.ip,
            promo_page_id: "SLOT_GAME_1_REGISTER",
            campaign_name: req.body.campaign_name,
            visit: 1
        }], { session })

        if (req.body.dailys) {
            await SlotGameVisitMetric.create([{
                ip_address: req.ip,
                promo_page_id: `DAILY_EMAIL_${req.body.dailys}`,
                campaign_name: req.body.campaign_name,
                visit: 1
            }], { session })
        }

        await session.commitTransaction()
        res.status(200).json({ success: true })
    } catch (error) {
        await session.abortTransaction()
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    } finally {
        session.endSession()
    }
}

exports.trackSlotGame1NoFundz = async (req, res) => {
    try {
        await SlotGameVisitMetric.create({
            ip_address: req.ip,
            promo_page_id: "SLOT_GAME_1_NO_FUNDS",
            campaign_name: req.body.campaign_name,
            visit: 1
        })
        res.status(200).json({ success: true })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}

exports.trackSlotGame1Cards = async (req, res) => {
    try {
        await SlotGameVisitMetric.create({
            ip_address: req.ip,
            promo_page_id: "SLOT_1_SUBSCRIBE_0_0",
            visit: 1
        })
        res.status(200).json({ success: true })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}

exports.trackSubscribe = async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        let updateQuery = {}
        let promoPageId
        switch (parseFloat(req.params.amount)) {
            case 9.99:
                updateQuery = { $inc: { track_sub_9_99: 1 } }
                promoPageId = "Subscribe_9_99"
                break
            case 19.99:
                updateQuery = { $inc: { track_sub_19_99: 1 } }
                promoPageId = "Subscribe_19_99"
                break
            case 29.99:
                updateQuery = { $inc: { track_sub_29_99: 1 } }
                promoPageId = "Subscribe_29_99"
                break
            case 39.95:
                updateQuery = { $inc: { track_sub_39_99: 1 } }
                promoPageId = "Subscribe_39_95"
                break
            default:
                break
        }
        await PlanSubscription.findOneAndUpdate({}, updateQuery, { upsert: true, new: true, session })
        await PromoPageMetric.create([{
            ip_address: req.ip,
            promo_page_id: promoPageId,
            campaign_name: req.body.campaign_name,
            visit: 1
        }], { session })
        await session.commitTransaction()
        res.status(200).json({ success: true })
    } catch (error) {
        await session.abortTransaction()
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    } finally {
        session.endSession()
    }
}

const getRecordsByDateRange = async (startDate, endDate) => {
    return await PromoPageMetric.aggregate([
        {
            $match: {
                created_at: { $gte: startDate, $lte: endDate },
                promo_page_id: { $in: promoPageIds }
            }
        },
        {
            $group: {
                _id: "$promo_page_id",
                total_visits: { $sum: "$visit" }
            }
        },
        {
            $project: {
                promo_page_id: "$_id",
                total_visits: 1,
                _id: 0
            }
        }
    ])
}

exports.getSubscriptionMetrics = async (req, res) => {
    try {
        const plans = await PlanSubscription.findOne() || new PlanSubscription()
        let metrics = []
        const today = new Date()
        const startOfToday = new Date(today)
        startOfToday.setHours(0, 0, 0, 0)
        const endOfToday = new Date(today)
        endOfToday.setHours(23, 59, 59, 999)

        switch (req.query.sortBy) {
            case 'today':
                metrics = await getRecordsByDateRange(startOfToday, endOfToday)
                break
            case 'yesterday':
                const yesterday = new Date(today)
                yesterday.setDate(today.getDate() - 1)
                const startOfYesterday = new Date(yesterday)
                startOfYesterday.setHours(0, 0, 0, 0)
                const endOfYesterday = new Date(yesterday)
                endOfYesterday.setHours(23, 59, 59, 999)
                metrics = await getRecordsByDateRange(startOfYesterday, endOfYesterday)
                break
            case 'twoDaysAgo':
                const twoDaysAgo = new Date(today)
                twoDaysAgo.setDate(today.getDate() - 2)
                const startOfTwoDaysAgo = new Date(twoDaysAgo)
                startOfTwoDaysAgo.setHours(0, 0, 0, 0)
                const endOfTwoDaysAgo = new Date(twoDaysAgo)
                endOfTwoDaysAgo.setHours(23, 59, 59, 999)
                metrics = await getRecordsByDateRange(startOfTwoDaysAgo, endOfTwoDaysAgo)
                break
            case 'threeDaysAgo':
                const threeDaysAgo = new Date(today)
                threeDaysAgo.setDate(today.getDate() - 3)
                const startOfThreeDaysAgo = new Date(threeDaysAgo)
                startOfThreeDaysAgo.setHours(0, 0, 0, 0)
                const endOfThreeDaysAgo = new Date(threeDaysAgo)
                endOfThreeDaysAgo.setHours(23, 59, 59, 999)
                metrics = await getRecordsByDateRange(startOfThreeDaysAgo, endOfThreeDaysAgo)
                break
            case 'thisWeek':
                const startOfThisWeek = new Date(today)
                startOfThisWeek.setDate(today.getDate() - today.getDay())
                startOfThisWeek.setHours(0, 0, 0, 0)
                metrics = await getRecordsByDateRange(startOfThisWeek, endOfToday)
                break
            case 'lastWeek':
                const startOfLastWeek = new Date(today)
                startOfLastWeek.setDate(today.getDate() - today.getDay() - 7)
                startOfLastWeek.setHours(0, 0, 0, 0)
                const endOfLastWeek = new Date(today)
                endOfLastWeek.setDate(today.getDate() - today.getDay() - 1)
                endOfLastWeek.setHours(23, 59, 59, 999)
                metrics = await getRecordsByDateRange(startOfLastWeek, endOfLastWeek)
                break
            case 'lastTwoWeeks':
                const startOfLastTwoWeeks = new Date(today)
                startOfLastTwoWeeks.setDate(today.getDate() - today.getDay() - 14)
                startOfLastTwoWeeks.setHours(0, 0, 0, 0)
                const endOfLastTwoWeeks = new Date(today)
                endOfLastTwoWeeks.setDate(today.getDate() - today.getDay() - 1)
                endOfLastTwoWeeks.setHours(23, 59, 59, 999)
                metrics = await getRecordsByDateRange(startOfLastTwoWeeks, endOfLastTwoWeeks)
                break
            case 'thisMonth':
                const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                startOfThisMonth.setHours(0, 0, 0, 0)
                metrics = await getRecordsByDateRange(startOfThisMonth, endOfToday)
                break
            case 'lastMonth':
                const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                startOfLastMonth.setHours(0, 0, 0, 0)
                const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
                endOfLastMonth.setHours(23, 59, 59, 999)
                metrics = await getRecordsByDateRange(startOfLastMonth, endOfLastMonth)
                break
            case 'twoMonthsAgo':
                const startOfTwoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1)
                startOfTwoMonthsAgo.setHours(0, 0, 0, 0)
                const endOfTwoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 1, 0)
                endOfTwoMonthsAgo.setHours(23, 59, 59, 999)
                metrics = await getRecordsByDateRange(startOfTwoMonthsAgo, endOfTwoMonthsAgo)
                break
            case 'threeMonthsAgo':
                const startOfThreeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1)
                startOfThreeMonthsAgo.setHours(0, 0, 0, 0)
                const endOfThreeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 0)
                endOfThreeMonthsAgo.setHours(23, 59, 59, 999)
                metrics = await getRecordsByDateRange(startOfThreeMonthsAgo, endOfThreeMonthsAgo)
                break
            case 'thisYear':
                const startOfThisYear = new Date(today.getFullYear(), 0, 1)
                startOfThisYear.setHours(0, 0, 0, 0)
                metrics = await getRecordsByDateRange(startOfThisYear, endOfToday)
                break
            case 'lastYear':
                const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1)
                startOfLastYear.setHours(0, 0, 0, 0)
                const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31)
                endOfLastYear.setHours(23, 59, 59, 999)
                metrics = await getRecordsByDateRange(startOfLastYear, endOfLastYear)
                break
            default:
                metrics = await exports.getTotalVisits()
                break
        }
        res.status(200).json({ success: true, data: { plans, metrics } })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}

exports.getMediaPageMetrics = async (req, res) => {
    try {
        const music_visit = await MusicVisit.countDocuments()
        const game_visit = await GameVisit.countDocuments()
        const music_time_spent = await MusicPlayTime.aggregate([
            {
                $group: {
                    _id: { music: "$music", music_name: "$music_name" },
                    total_time_spent: {
                        $sum: { $dateDiff: { startDate: "$created_at", endDate: "$updated_at", unit: "second" } }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    music: "$_id.music",
                    music_name: "$_id.music_name",
                    total_time_spent: {
                        $dateToString: { format: "%H:%M:%S", date: new Date(0), timezone: "UTC" }
                    }
                }
            },
            { $sort: { total_time_spent: -1 } }
        ])
        const game_time_spent = await GamePlayTime.aggregate([
            {
                $lookup: {
                    from: 'games',
                    localField: 'game',
                    foreignField: 'id',
                    as: 'gameInfo'
                }
            },
            { $unwind: '$gameInfo' },
            {
                $group: {
                    _id: "$gameInfo.name",
                    total_time_spent: {
                        $sum: { $dateDiff: { startDate: "$created_at", endDate: "$updated_at", unit: "second" } }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    game_name: "$_id",
                    total_time_spent: {
                        $dateToString: { format: "%H:%M:%S", date: new Date(0), timezone: "UTC" }
                    }
                }
            },
            { $sort: { total_time_spent: -1 } }
        ])
        res.status(200).json({ success: true, data: { music_visit, game_visit, music_time_spent, game_time_spent } })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}

exports.getUserMediaPageMetrics = async (req, res) => {
    try {
        const music_visit = await MusicVisit.countDocuments({ user_id: req.params.id })
        const game_visit = await GameVisit.countDocuments({ user_id: req.params.id })
        const music_time_spent = await MusicPlayTime.aggregate([
            { $match: { user_id: mongoose.Types.ObjectId(req.params.id) } },
            {
                $group: {
                    _id: { music: "$music", music_name: "$music_name" },
                    total_time_spent: {
                        $sum: { $dateDiff: { startDate: "$created_at", endDate: "$updated_at", unit: "second" } }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    music: "$_id.music",
                    music_name: "$_id.music_name",
                    total_time_spent: {
                        $dateToString: { format: "%H:%M:%S", date: new Date(0), timezone: "UTC" }
                    }
                }
            },
            { $sort: { total_time_spent: -1 } }
        ])
        const game_time_spent = await GamePlayTime.aggregate([
            { $match: { user_id: mongoose.Types.ObjectId(req.params.id) } },
            {
                $lookup: {
                    from: 'games',
                    localField: 'game',
                    foreignField: 'id',
                    as: 'gameInfo'
                }
            },
            { $unwind: '$gameInfo' },
            {
                $group: {
                    _id: "$gameInfo.name",
                    total_time_spent: {
                        $sum: { $dateDiff: { startDate: "$created_at", endDate: "$updated_at", unit: "second" } }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    game_name: "$_id",
                    total_time_spent: {
                        $dateToString: { format: "%H:%M:%S", date: new Date(0), timezone: "UTC" }
                    }
                }
            },
            { $sort: { total_time_spent: -1 } }
        ])
        res.status(200).json({ success: true, data: { music_visit, game_visit, music_time_spent, game_time_spent } })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}

exports.getMusicsMetrics = async (req, res) => {
    try {
        const music_visit = await MusicVisit.countDocuments()
        res.status(200).json({ success: true, data: music_visit })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}

exports.getUserMusicsMetrics = async (req, res) => {
    try {
        const music_visit = await MusicVisit.countDocuments({ user_id: req.params.id })
        res.status(200).json({ success: true, data: music_visit })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}

exports.getGamesMetrics = async (req, res) => {
    try {
        const game_visit = await GameVisit.countDocuments()
        res.status(200).json({ success: true, data: game_visit })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message })
    }
}
