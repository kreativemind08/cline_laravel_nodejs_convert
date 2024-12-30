const Rating = require('../models/Rating');

exports.create = async (req, res) => {
    try {
        const { rating } = req.body;
        const userId = req.user.id; // Assuming user ID is available in the request

        let existingRating = await Rating.findOne({ user_id: userId });

        if (existingRating) {
            existingRating.rating = rating;
            await existingRating.save();
            res.status(200).json({ success: true, message: "Rating Saved" });
        } else {
            const newRating = new Rating({
                user_id: userId,
                rating: rating
            });
            await newRating.save();
            res.status(200).json({ success: true, message: "Rating Saved" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
};

exports.getRating = async (req, res) => {
    try {
        const rating = await Rating.findOne({ user_id: req.user.id });
        res.status(200).json({ success: true, data: { rating } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
};
