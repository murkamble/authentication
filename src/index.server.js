const express = require('express')
const env = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')

// environment variable or you can say constants
const app = express()
env.config()
app.use(express.json())
app.use(cors())

// mongoose Databases connection string
connectDB()

// routes
const authRoutes = require('./routes/auth')

// api
app.use('/api/auth', authRoutes)

// Error Handler (Should be last piece of middleware)
app.use(errorHandler)

// Listing Port
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})

// // Process Error
// process.on('unhandledRejection', (err, promise) => {
//     console.log(`Logged Error: ${err}`)
//     server.close(() => process.exit(1))
// })