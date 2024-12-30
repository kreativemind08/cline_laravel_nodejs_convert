const express = require('express')
const path = require('path')
const db = require('./database.js')
const UserModel = require('./models/User.js')
const PaymentModel = require('./models/Payment.js')
const TransactionModel = require('./models/Transaction.js')
const PlanSubscriptionModel = require('./models/PlanSubscription.js')
const ContentItemModel = require('./models/ContentItem.js')
const RatingModel = require('./models/Rating.js')
const CardModel = require('./models/Card.js')
const GameModel = require('./models/Game.js')
const MusicModel = require('./models/Music.js')
const SlotMachineModel = require('./models/SlotMachine.js')
const GameWalletModel = require('./models/GameWallet.js')

const app = express()
const port = 3000

// Initialize models
const User = UserModel
const Payment = PaymentModel
const Transaction = TransactionModel
const PlanSubscription = PlanSubscriptionModel
const ContentItem = ContentItemModel
const Rating = RatingModel
const Card = CardModel
const Game = GameModel
const Music = MusicModel
const SlotMachine = SlotMachineModel
const GameWallet = GameWalletModel

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

const AuthenticationController = require('./controllers/AuthenticationController.js')
const ForgotPasswordController = require('./controllers/ForgotPasswordController.js')
const RocketGatePaymentController = require('./controllers/RocketGatePaymentController.js')
const ContentItemController = require('./controllers/ContentItemController.js')
const UserSettingController = require('./controllers/UserSettingController.js')
const PageEditController = require('./controllers/PageEditController.js')
const RatingController = require('./controllers/RatingController.js')
const CardController = require('./controllers/CardController.js')
const AnalyticsController = require('./controllers/AnalyticsController.js')
const GameMetricsController = require('./controllers/GameMetricsController.js')
const GamesController = require('./controllers/GamesController.js')
const MusicMetricsController = require('./controllers/MusicMetricsController.js')
const SlotMachineController = require('./controllers/SlotMachineController.js')
const GameWalletController = require('./controllers/GameWalletController.js')
const SupportController = require('./controllers/SupportController.js')

app.use(express.json())

// Authentication Routes
app.post('/register', AuthenticationController.createUser)
app.post('/promotion-register', AuthenticationController.promotionRegister)
// app.post('/admin-register', AuthenticationController.adminRegister)
app.post('/login', AuthenticationController.login)
app.post('/admin-login', AuthenticationController.adminLogin)
app.post('/logout', AuthenticationController.logout)
app.post('/verify-account/:token', AuthenticationController.verifyAccount)
app.post('/password/email', ForgotPasswordController.forgotPasswordEmail)
app.post('/password/reset', ForgotPasswordController.reset)
// RocketGate Payment Routes
app.post('/rocketGate-pay/:id', RocketGatePaymentController.pay)
app.post('/rocketGate-savePayment', RocketGatePaymentController.savePayment)
app.get('/getCustomers', AuthenticationController.getCustomers)
app.get('/getUsers', AuthenticationController.getUsers)
app.post('/upload-avatar', AuthenticationController.uploadAvatar)

// Content Item Routes
app.post('/contentItem', ContentItemController.saveContentItem)
app.get('/contentItem', ContentItemController.getAllContentItems)
app.get('/contentItem4', ContentItemController.getFourContentItems)
app.get('/movies', ContentItemController.getMovies)
app.get('/musics', ContentItemController.getMusics)
app.get('/ebooks', ContentItemController.getEbooks)
app.get('/audioBooks', ContentItemController.getAudioBooks)
app.get('/item/:id', ContentItemController.getItemById)
app.post('/updateItem', ContentItemController.updateItem)
app.post('/deleteItem', ContentItemController.deleteItem)

// User Setting Routes
app.post('/unsubscribe-email-notification/:id', UserSettingController.unsubscribeEmailNotification)
app.post('/reset-password', UserSettingController.resetPassword)
app.post('/resetPassword', UserSettingController.changePassword)
app.post('/saveCard', UserSettingController.saveCard)

// Page Edit Routes
app.post('/saveIndex', PageEditController.saveIndex)
app.get('/getIndex', PageEditController.getIndex)
app.post('/saveAbout', PageEditController.saveAbout)
app.get('/getAbout', PageEditController.getAbout)
app.post('/saveFaq', PageEditController.saveFaq)
app.get('/getFaq', PageEditController.getFaq)
app.post('/savePolicy', PageEditController.savePolicy)
app.get('/getPolicy', PageEditController.getPolicy)

// Rating Routes
app.post('/save-rating', RatingController.saveRating)
app.get('/get-rating', RatingController.getRating)

// RocketGate Payment Routes
app.get('/cancel-rocketgate-rebilling/:id', RocketGatePaymentController.cancelRebilling)
app.post('/cancel-membership', RocketGatePaymentController.cancelMembership)
app.post('/cancel-user-membership/:id/:action', RocketGatePaymentController.cancelUserMembership)
app.post('/plan-to-pay', RocketGatePaymentController.planToPay)
app.get('/refresh-payment', RocketGatePaymentController.refreshPayment)

// Card Routes
app.get('/get-card', CardController.getCard)

// Analytics Routes
app.post('/track-login', AnalyticsController.trackLogin)
app.post('/track-screen-time', AnalyticsController.trackScreenTime)
app.post('/update-screen-time', AnalyticsController.updateScreenTime)
app.post('/track-page-visit', AnalyticsController.trackPageVisit)
app.get('/admin-login-history/:id', AnalyticsController.adminLoginHistory)
app.get('/admin-page-visit/:id', AnalyticsController.adminPageView)
app.post('/lp1-page-visit', AnalyticsController.lp1PageView)
app.post('/slot-game-1-visit', AnalyticsController.slotGame1Visit)
app.post('/slot-game-1-visit/:id', AnalyticsController.slotGame1VisitWithId)
app.post('/slot-game-1-register-visit', AnalyticsController.slotGame1RegisterVisit)
app.post('/slot-game-1-no-funds', AnalyticsController.slotGame1NoFunds)
app.post('/slot-game-1-cards', AnalyticsController.slotGame1Cards)
app.post('/lp1-register-page-visit', AnalyticsController.lp1RegisterPageView)
app.post('/subscribe-page-visit/:amount', AnalyticsController.subscribePageView)
app.get('/metrics', AnalyticsController.getMetrics)
app.get('/music-metrics', MusicMetricsController.getMusicMetrics)
app.get('/music-play-time', MusicMetricsController.getMusicPlayTime)
app.get('/game-metrics', GameMetricsController.getGameMetrics)
app.get('/game-metrics/:id', GameMetricsController.getGameMetricsById)
app.get('/game-play-time', GameMetricsController.getGamePlayTime)
app.get('/media_pages_metric', AnalyticsController.getMediaPagesMetric)
app.get('/media_pages_metric/:id', AnalyticsController.getMediaPagesMetricById)
app.get('/promo-page-metrics', AnalyticsController.getPromoPageMetrics)
app.post('/prime-play-records', AnalyticsController.primePlayRecords)
app.get('/prime-play-update', AnalyticsController.primePlayUpdate)
app.get('/prime-play-records', AnalyticsController.getPrimePlayRecords)

// Game Routes
app.post('/create-game', GamesController.createGame)
app.get('/get-games', GamesController.getGames)
app.get('/get-game/:id', GamesController.getGameById)
app.put('/update-game/:id', GamesController.updateGame)
app.delete('/delete-game/:id', GamesController.deleteGame)
app.post('/track-game-visit', GamesController.trackGameVisit)
app.post('/track-game-detail-view', GamesController.trackGameDetailView)
app.post('/start-game-play', GamesController.startGamePlay)
app.post('/end-game-play', GamesController.endGamePlay)

// Music Metrics Routes
app.post('/track-music-visit', MusicMetricsController.trackMusicVisit)
app.post('/start-music-play', MusicMetricsController.startMusicPlay)
app.post('/end-music-play', MusicMetricsController.endMusicPlay)

// Support Route
app.post('/submit-support', SupportController.submitSupport)

// Slot Game Routes
app.post('/slot-machine/register', SlotMachineController.register)
app.post('/slot-machine/track-spin', SlotMachineController.trackSpin)
app.get('/slot-machine/send-emails', SlotMachineController.sendEmails)
app.get('/slot-machine/get-slot-user/:id', SlotMachineController.getSlotUser)

// Game Wallet Routes
app.post('/paymentLink', GameWalletController.createPaymentLink)
app.post('/payment-success', GameWalletController.paymentSuccess)
app.get('/wallet/:userId', GameWalletController.getWallet)
app.post('/wallet/fund', GameWalletController.fundWallet)
app.post('/wallet/debit', GameWalletController.debitWallet)
app.post('/wallet/setBalance', GameWalletController.setBalance)
