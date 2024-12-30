const User = require('../models/User.js');
const Card = require('../models/Card.js');
const PlanSubscription = require('../models/PlanSubscription.js');
const GameWallet = require('../models/GameWallet.js');
const { validationResult } = require('express-validator')
const axios = require('axios');
const mailer = require('../utils/mailer.js'); // Assuming you have a mailer utility

const RocketGatePaymentController = {
    createPaymentLink: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.params.id;
        const { amount, trial, prodId, currency } = req.body;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const merchantId = process.env.RG_MERCHANT_ID; // Replace with your actual env var name
            const hashSecret = process.env.RG_HASH_SECRET; // Replace with your actual env var name
            const frontendUrl = process.env.RG_FRONTEND_URL; // Replace with your actual env var name
            const rgLink = process.env.RG_LINK; // Replace with your actual env var name

            const invoice = Date.now();
            const time = Math.floor(Date.now() / 1000);

            const urlStuff = new URLSearchParams();
            urlStuff.append('merch', merchantId);
            urlStuff.append('id', userId);
            urlStuff.append('invoice', invoice);
            urlStuff.append('prodId', prodId);
            urlStuff.append('rebill-amount', amount);
            urlStuff.append('rebill-freq', 'MONTHLY');
            urlStuff.append('email', user.email);
            urlStuff.append('address', '*hide*');
            urlStuff.append('country', '*hide*');
            urlStuff.append('tos', 'https://onehubplay.com/privacy');
            urlStuff.append('style', 'https://onehubplay.com/assets/css/index.css');
            urlStuff.append('zip', '*hide*');
            urlStuff.append('currency', currency);
            urlStuff.append('method', 'CC');
            urlStuff.append('siteid', 1);
            urlStuff.append('time', time);
            urlStuff.append('success', `${frontendUrl}/payment-success`);
            urlStuff.append('fail', `${frontendUrl}/payment-error`);

            if (trial === 'true') {
                urlStuff.append('amount', '0.00');
                urlStuff.append('purchase', 'FALSE');
                urlStuff.append('rebill-start', '3');
            } else {
                urlStuff.append('amount', amount);
                urlStuff.append('purchase', 'TRUE');
            }

            const dataToEncode = urlStuff.toString();
            const hash = crypto.createHmac('sha256', hashSecret).update(dataToEncode).digest('hex');
            urlStuff.append('hash', hash);

            const link = `${rgLink}${urlStuff.toString()}`;

            res.status(200).json({ link });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    },

    cancelRocketGateSuscription: async (req, res) => {
        const userId = req.params.id;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const merchantId = process.env.RG_MERCHANT_ID; // Replace with your actual env var name
            const hashSecret = process.env.RG_HASH_SECRET; // Replace with your actual env var name
            const frontendUrl = process.env.RG_FRONTEND_URL; // Replace with your actual env var name
            const rgCancelLink = process.env.RG_CANCEL_LINK; // Replace with your actual env var name

            const urlStuff = new URLSearchParams();
            urlStuff.append('merch', merchantId);
            urlStuff.append('id', userId);
            urlStuff.append('invoice', user.invoice_id);
            urlStuff.append('success', `${frontendUrl}/cancel-success`);
            urlStuff.append('fail', `${frontendUrl}/myAccount?to=cancel-rebill`);

            const dataToEncode = urlStuff.toString();
            const hash = crypto.createHmac('sha256', hashSecret).update(dataToEncode).digest('hex');
            urlStuff.append('hash', hash);

            const link = `${rgCancelLink}${urlStuff.toString()}`;

            res.status(200).json({ link });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    },

    getTransactionDetails: async (invoiceId) => {
        try {
            const rgTransactionLink = process.env.RG_TRANSACTION_LINK; // Replace with your actual env var name
            const merchantId = process.env.RG_MERCHANT_ID; // Replace with your actual env var name
            const gatewayPassword = process.env.RG_GW_PASSWORD; // Replace with your actual env var name

            const response = await axios.get(rgTransactionLink, {
                params: {
                    method: 'lookupTransaction',
                    fromDate: '01-Jun-09', // Consider making these dynamic if needed
                    toDate: '01-Jul-25', // Consider making these dynamic if needed
                    merch_id: merchantId,
                    respc_id: 0,
                    ttype_id: '3,2',
                    tstate_id: 'TRUE',
                    gatewayPassword: gatewayPassword,
                    inv_id_ext: invoiceId,
                },
            });

            const xmlData = response.data;
            const jsonData = xmlToJson(xmlData); // Helper function to convert XML to JSON
            return { status: true, transaction: jsonData.response.transaction || [] };
        } catch (error) {
            console.error(error);
            return { status: false, error: 'Failed to fetch payment details' };
        }
    },

    getTransactions: async () => {
        try {
            const rgTransactionLink = process.env.RG_TRANSACTION_LINK; // Replace with your actual env var name
            const merchantId = process.env.RG_MERCHANT_ID; // Replace with your actual env var name
            const gatewayPassword = process.env.RG_GW_PASSWORD; // Replace with your actual env var name

            const response = await axios.get(rgTransactionLink, {
                params: {
                    method: 'lookupTransaction',
                    fromDate: '01-Jun-09', // Consider making these dynamic if needed
                    toDate: '01-Jul-25', // Consider making these dynamic if needed
                    merch_id: merchantId,
                    respc_id: 0,
                    ttype_id: '3,2',
                    tstate_id: 'TRUE',
                    gatewayPassword: gatewayPassword,
                },
            });

            const xmlData = response.data;
            const jsonData = xmlToJson(xmlData); // Helper function to convert XML to JSON
            return { status: true, transaction: jsonData.response.transaction || [] };
        } catch (error) {
            console.error(error);
            return { status: false, error: 'Failed to fetch payment details' };
        }
    },

    refreshPayment: async (req, res) => {
        try {
            const transactionReq = await RocketGatePaymentController.getTransactions();
            const usersToUpdate = [];

            if (transactionReq.status) {
                const transactions = transactionReq.transaction;
                for (const transaction of transactions) {
                    const user = await User.findById(transaction.cust_id_ext);
                    if (user && user.invoice_id !== transaction.inv_id_ext) {
                        usersToUpdate.push(user);
                        user.invoice_id = transaction.inv_id_ext;
                        user.is_subscribed = true;
                        await user.save();

                        const card = await Card.findOneAndUpdate(
                            { user_id: user.id },
                            {
                                user_id: user.id,
                                first_name: transaction.fname,
                                last_name: transaction.lname,
                                exp_date_m: transaction.expiremonth,
                                exp_date_y: transaction.expireyear,
                                card_number: transaction.tr_pay_num_l4,
                                transaction_id: transaction.tr_id,
                                card_name: transaction.card_name,
                                card_type: transaction.card_type,
                                amount: transaction.tr_amount,
                                curr_code_requested: transaction.curr_code_requested,
                                tr_date: transaction.tr_date,
                                email: transaction.email,
                                cvv: '0000', // Assuming default value
                            },
                            { upsert: true, new: true }
                        );

                        if ((!user.settings || user.settings.email_notification) && mailer && mailer.sendUserSubscriptionEmail) {
                            mailer.sendUserSubscriptionEmail(user.email, card);
                        }
                    }
                }
            }

            res.status(200).json({ users: usersToUpdate });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    },

    savePaymentDetails: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id, invoiceID, countryCode, city, zipcode, timezone } = req.body;

        try {
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.invoice_id = invoiceID;
            user.is_subscribed = true;
            await user.save();

            const transaction = await RocketGatePaymentController.getTransactionDetails(invoiceID);
            let cardDetails = {};
            let amount = 0.00;

            if (transaction.status && transaction.transaction.length > 0) {
                const transactionData = transaction.transaction[0];
                cardDetails = await Card.findOneAndUpdate(
                    { user_id: id },
                    {
                        user_id: id,
                        first_name: transactionData.fname,
                        last_name: transactionData.lname,
                        exp_date_m: transactionData.expiremonth,
                        exp_date_y: transactionData.expireyear,
                        card_number: transactionData.tr_pay_num_l4,
                        transaction_id: transactionData.tr_id,
                        card_name: transactionData.card_name,
                        card_type: transactionData.card_type,
                        amount: transactionData.tr_amount,
                        country: countryCode,
                        city: city,
                        zipcode: zipcode,
                        timezone: timezone,
                        curr_code_requested: transactionData.curr_code_requested,
                        tr_date: transactionData.tr_date,
                        email: transactionData.email,
                        cvv: '0000', // Assuming default
                        isTrial: false,
                    },
                    { upsert: true, new: true }
                );
                amount = transactionData.tr_amount;
            } else {
                user.trial_status = 'Active';
                await user.save();
                const amounts = [9.99, 19.99, 29.99, 39.95];
                amount = amounts[3]; // Defaulting to the 4th plan

                cardDetails = await Card.findOneAndUpdate(
                    { user_id: id },
                    {
                        user_id: id,
                        isTrial: true,
                        amount: amount,
                        tr_date: new Date().toISOString(),
                    },
                    { upsert: true, new: true }
                );
            }

            const plan = await PlanSubscription.findOne();
            if (plan) {
                switch (parseFloat(amount)) {
                    case 9.99:
                        plan.currentPlan = 1;
                        break;
                    case 19.99:
                        plan.currentPlan = 2;
                        break;
                    case 29.99:
                        plan.currentPlan = 3;
                        break;
                    default:
                        plan.currentPlan = 1;
                        break;
                }
                await plan.save();
            }

            if ((!user.settings || user.settings.email_notification) && mailer && mailer.sendUserSubscriptionEmail) {
                mailer.sendUserSubscriptionEmail(user.email, cardDetails);
            }
            if (mailer && mailer.sendAdminNewSubscriptionEmail) {
                mailer.sendAdminNewSubscriptionEmail(user);
            }

            const token = jwt.sign({ userId: user.id }, 'secretKey', { // TODO: Replace with actual secret
                expiresIn: '1h',
            });

            res.status(200).json({ token, user, card: transaction.transaction });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    },

    savePaymentDetails2: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id, invoiceID, countryCode, city, zipcode, timezone } = req.body;

        try {
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            user.invoice_id = invoiceID;
            user.is_subscribed = true;
            await user.save();

            const transaction = await RocketGatePaymentController.getTransactionDetails(invoiceID);
            let cardDetails = {};
            let amount = 0.00;

            if (transaction.status && transaction.transaction.length > 0) {
                const transactionData = transaction.transaction[0];
                cardDetails = await Card.findOneAndUpdate(
                    { user_id: id },
                    {
                        user_id: id,
                        first_name: transactionData.fname,
                        last_name: transactionData.lname,
                        exp_date_m: transactionData.expiremonth,
                        exp_date_y: transactionData.expireyear,
                        card_number: transactionData.tr_pay_num_l4,
                        transaction_id: transactionData.tr_id,
                        card_name: transactionData.card_name,
                        card_type: transactionData.card_type,
                        amount: transactionData.tr_amount,
                        country: countryCode,
                        city: city,
                        zipcode: zipcode,
                        timezone: timezone,
                        curr_code_requested: transactionData.curr_code_requested,
                        tr_date: transactionData.tr_date,
                        email: transactionData.email,
                        cvv: '0000',
                        isTrial: false,
                    },
                    { upsert: true, new: true }
                );
                amount = transactionData.tr_amount;
            } else {
                user.trial_status = 'Active';
                await user.save();
                const plan = await PlanSubscription.findOne();
                const amounts = [9.99, 19.99, 29.99];
                amount = amounts[plan && plan.currentPlan === 3 ? 0 : plan.currentPlan];

                cardDetails = await Card.findOneAndUpdate(
                    { user_id: id },
                    {
                        user_id: id,
                        isTrial: true,
                        amount: amount,
                        tr_date: new Date().toISOString(),
                    },
                    { upsert: true, new: true }
                );
            }

            const plan = await PlanSubscription.findOne();
            if (plan) {
                switch (parseFloat(amount)) {
                    case 9.99:
                        plan.currentPlan = 1;
                        break;
                    case 19.99:
                        plan.currentPlan = 2;
                        break;
                    case 29.99:
                        plan.currentPlan = 3;
                        break;
                    default:
                        plan.currentPlan = 1;
                        break;
                }
                plan.is_trial = !plan.is_trial;
                await plan.save();
            }

            if ((!user.settings || user.settings.email_notification) && mailer && mailer.sendUserSubscriptionEmail) {
                mailer.sendUserSubscriptionEmail(user.email, cardDetails);
            }
            if (mailer && mailer.sendAdminNewSubscriptionEmail) {
                mailer.sendAdminNewSubscriptionEmail(user);
            }

            const token = jwt.sign({ userId: user.id }, 'secretKey', { // TODO: Replace with actual secret
                expiresIn: '1h',
            });

            res.status(200).json({ token, user, card: transaction.transaction });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    },

    cancelMembership: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            user.invoice_id = null;
            user.is_subscribed = false;
            await user.save();
            res.status(200).json({ user, false: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    },

    cancelUserMembership: async (req, res) => {
        const { id, action } = req.params;
        try {
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (action === 'Deactivate') {
                user.is_subscribed = false;
            } else if (action === 'Activate') {
                user.is_subscribed = true;
            } else if (action === 'Subscribe') {
                user.invoice_id = 1;
                user.is_subscribed = true;
            }
            await user.save();
            const customers = await RocketGatePaymentController.getCustomers();
            res.status(200).json(customers);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    },

    getCustomers: async () => {
        const users = await User.find().populate('card').sort({ createdAt: -1 });
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
        }));
        return mergedData;
    },

    trackPlans: async (req, res) => {
        try {
            let plan = await PlanSubscription.findOne();
            if (!plan) {
                plan = new PlanSubscription();
            }
            let toPay = 0;
            if (plan.currentPlan < 3) {
                toPay = plan.currentPlan + 1;
            } else if (plan.currentPlan === 3) {
                toPay = 1;
            }
            res.status(200).json({ to_pay: toPay });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    },
};

// Helper function to convert XML to JSON
function xmlToJson(xml) {
    let obj = {};
    if (xml.nodeType === 1) {
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (let j = 0; j < xml.attributes.length; j++) {
                let attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) {
        obj = xml.nodeValue;
    }
    if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
            let item = xml.childNodes.item(i);
            let nodeName = item.nodeName;
            if (typeof obj[nodeName] === 'undefined') {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof obj[nodeName].push === 'undefined') {
                    let old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}

module.exports = RocketGatePaymentController;
