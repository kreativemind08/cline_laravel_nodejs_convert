const IndexPage = require('../models/IndexPage');
const AboutPage = require('../models/AboutPage');
const Faq = require('../models/Faq');
const Policy = require('../models/Policy');

exports.saveIndex = async (req, res) => {
    try {
        const {
            scn1_bg_image,
            scn1_left_image,
            scn1_title,
            scn1_description,
            scn2_bg_image,
            scn2_item1_image,
            scn2_item1_title,
            scn2_item1_description,
            scn2_item2_image,
            scn2_item2_title,
            scn2_item2_description,
            scn2_item3_image,
            scn2_item3_title,
            scn2_item3_description,
            scn2_item1_modal_gif,
            scn2_item2_modal_gif,
            scn2_item3_modal_gif,
            scn1_button_text,
            scn2_item1_button_text,
            scn2_item2_button_text,
            scn2_item3_button_text,
        } = req.body;

        const indexPage = await IndexPage.findOneAndUpdate({}, {
            scn1_bg_image,
            scn1_left_image,
            scn1_title,
            scn1_description,
            scn2_bg_image,
            scn2_item1_image,
            scn2_item1_title,
            scn2_item1_description,
            scn2_item2_image,
            scn2_item2_title,
            scn2_item2_description,
            scn2_item3_image,
            scn2_item3_title,
            scn2_item3_description,
            scn2_item1_modal_gif,
            scn2_item2_modal_gif,
            scn2_item3_modal_gif,
            scn1_button_text,
            scn2_item1_button_text,
            scn2_item2_button_text,
            scn2_item3_button_text,
        }, { upsert: true, new: true });

        res.status(200).json({
            success: true,
            data: indexPage,
            message: 'Data has been saved successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
};

exports.getIndex = async (req, res) => {
    try {
        const indexPage = await IndexPage.findOne();
        res.status(200).json({ success: true, data: indexPage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
};

exports.saveAbout = async (req, res) => {
    try {
        const {
            scn1_bg_image,
            scn1_title,
            scn2_bg_image,
            scn2_title,
            scn2_description1,
            scn2_description2,
            scn3_bg_image,
            scn3_title,
            scn3_description,
            scn4_bg_image,
            scn4_item1_image,
            scn4_item1_title,
            scn4_item2_image,
            scn4_item2_title,
            scn4_item3_image,
            scn4_item3_title,
            scn5_bg_image,
            scn5_left_image,
            scn5_title,
            scn5_description,
        } = req.body;

        const aboutPage = await AboutPage.findOneAndUpdate({}, {
            scn1_bg_image,
            scn1_title,
            scn2_bg_image,
            scn2_title,
            scn2_description1,
            scn2_description2,
            scn3_bg_image,
            scn3_title,
            scn3_description,
            scn4_bg_image,
            scn4_item1_image,
            scn4_item1_title,
            scn4_item2_image,
            scn4_item2_title,
            scn4_item3_image,
            scn4_item3_title,
            scn5_bg_image,
            scn5_left_image,
            scn5_title,
            scn5_description,
        }, { upsert: true, new: true });

        res.status(200).json({
            success: true,
            data: aboutPage,
            message: 'Data has been saved successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
};

exports.getAbout = async (req, res) => {
    try {
        const aboutPage = await AboutPage.findOne();
        res.status(200).json({ success: true, data: aboutPage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
};

exports.saveFaq = async (req, res) => {
    try {
        await Faq.deleteMany(); // Clear existing FAQs
        await Faq.insertMany(req.body.faq);
        const faqs = await Faq.find();
        res.status(200).json({ success: true, data: faqs, message: 'Data has been saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
};

exports.getFaq = async (req, res) => {
    try {
        const faqs = await Faq.find();
        res.status(200).json({ success: true, data: faqs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
};

exports.savePolicy = async (req, res) => {
    try {
        await Promise.all(req.body.policy.map(async (policy) => {
            await Policy.findOneAndUpdate({ type: policy.type }, policy, { upsert: true, new: true });
        }));
        const policies = await Policy.find();
        res.status(200).json({ success: true, data: policies, message: 'Data has been saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
};

exports.getPolicy = async (req, res) => {
    try {
        const policies = await Policy.find();
        res.status(200).json({ success: true, data: policies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
};
