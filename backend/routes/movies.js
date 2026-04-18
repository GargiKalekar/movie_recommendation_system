const express = require('express')
const axios   = require('axios')
const router  = express.Router()

const FLASK_URL = 'http://localhost:5000'

// GET /api/movies/recommend?title=Avatar
router.get('/recommend', async (req, res) => {
    const { title } = req.query

    if (!title) {
        return res.status(400).json({ error: 'title is required' })
    }

    try {
        const response = await axios.get(`${FLASK_URL}/recommend`, {
            params: { title }
        })
        res.json(response.data)

    } catch (err) {
        if (err.response?.status === 404) {
            res.status(404).json(err.response.data)  // pass suggestions through
        } else {
            res.status(500).json({ error: 'Recommendation service unavailable' })
        }
    }
})

// GET /api/movies/search?q=dark
router.get('/search', async (req, res) => {
    const { q } = req.query
    try {
        const response = await axios.get(`${FLASK_URL}/search`, { params: { q } })
        res.json(response.data)
    } catch (err) {
        res.status(500).json({ error: 'Search failed' })
    }
})

module.exports = router