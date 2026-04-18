const express = require('express')
const cors    = require('cors')
const movieRoutes = require('./routes/movies')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/movies', movieRoutes)

app.listen(3001, () => console.log('Node server running on port 3001'))