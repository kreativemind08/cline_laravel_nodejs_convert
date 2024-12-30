const ContentItem = require('../models/ContentItem')
const { validationResult } = require('express-validator')
const { Op } = require('sequelize')

const ContentItemController = {
    saveContentItem: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const item = await ContentItem.create(req.body)
            res.status(200).json({ item, message: 'Media uploaded Successfully' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error: error.message })
        }
    },

    getMovies: async (req, res) => {
        try {
            const movies = await ContentItem.findAll({ where: { type: 'movie' } })
            const featured = await ContentItem.findOne({ where: { type: 'movie', featured: true } })
            res.status(200).json({ movies, featured })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error: error.message })
        }
    },

    getMusics: async (req, res) => {
        try {
            const musics = await ContentItem.findAll({ where: { type: 'music' } })
            const featured = await ContentItem.findOne({ where: { type: 'music', featured: true } })
            res.status(200).json({ musics, featured })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error: error.message })
        }
    },

    getEbooks: async (req, res) => {
        try {
            const ebooks = await ContentItem.findAll({ where: { type: 'ebook' } })
            const featured = await ContentItem.findOne({ where: { type: 'ebook', featured: true } })
            res.status(200).json({ ebooks, featured })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error: error.message })
        }
    },

    getAudioBooks: async (req, res) => {
        try {
            const audioBooks = await ContentItem.findAll({ where: { type: 'audioBook' } })
            const featured = await ContentItem.findOne({ where: { type: 'audioBook', featured: true } })
            res.status(200).json({ audioBooks, featured })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error: error.message })
        }
    },

    getItems: async (req, res) => {
        try {
            const movies = await ContentItem.findAll({ where: { type: 'movie' } })
            const musics = await ContentItem.findAll({ where: { type: 'music' } })
            const ebooks = await ContentItem.findAll({ where: { type: 'ebook' } })
            const audioBooks = await ContentItem.findAll({ where: { type: 'audioBook' } })
            const featured = await ContentItem.findAll({ where: { featured: true } })
            res.status(200).json({ movies, musics, ebooks, audioBooks, featured })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error: error.message })
        }
    },

    get4Items: async (req, res) => {
        try {
            const movies = await ContentItem.findAll({ where: { type: 'movie' }, limit: 4 })
            const musics = await ContentItem.findAll({ where: { type: 'music' }, limit: 4 })
            const ebooks = await ContentItem.findAll({ where: { type: 'ebook' }, limit: 4 })
            const audioBooks = await ContentItem.findAll({ where: { type: 'audioBook' }, limit: 4 })
            const featured = await ContentItem.findOne({ where: { type: 'movie', featured: true }, limit: 1 })
            res.status(200).json({ movies, musics, ebooks, audioBooks, featured })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error: error.message })
        }
    },

    getItem: async (req, res) => {
        const { id } = req.params
        try {
            const item = await ContentItem.findByPk(id)
            if (!item) {
                return res.status(404).json({ message: 'Media not found' })
            }
            res.status(200).json({ item })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error: error.message })
        }
    },

    updateItem: async (req, res) => {
        const { id } = req.params
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        try {
            const [updated] = await ContentItem.update(req.body, {
                where: { id: id }
            })
            if (updated) {
                const updatedItem = await ContentItem.findByPk(id)
                return res.status(200).json({ message: 'Media updated successfully', item: updatedItem })
            }
            return res.status(404).json({ message: 'Media not found' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error: error.message })
        }
    },

    deleteItem: async (req, res) => {
        const { id } = req.params
        try {
            const deleted = await ContentItem.destroy({
                where: { id: id }
            })
            if (deleted) {
                return res.status(200).json({ message: 'Media item deleted' })
            }
            return res.status(404).json({ message: 'Media not found' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error: error.message })
        }
    },
}

module.exports = ContentItemController
