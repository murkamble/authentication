const User = require('../models/user')
const ErrorResponse = require('../utlis/errorResponse')
const sendEmail = require('../utlis/sendEmail')
const crypto = require('crypto')
const shortid = require('shortid')

const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken()
    const { _id, username, firstName, lastName, email, fullName, dob } = user
    res.status(statusCode).json({ success: true, user: { _id, username, firstName, lastName, email, fullName, dob }, token })
}

exports.signup = async (req, res, next) => {
    User.findOne({ email: req.body.email })
        .exec(async (error, user) => {
            if (user) return next(new ErrorResponse('User already registered.', 400))
            const { firstName, lastName, dob, email, password } = req.body
            try {
                const _user = new User({ firstName, lastName, dob, email, password, username: firstName + shortid.generate() })
                const user = await User.create(_user)
                sendToken(user, 201, res)
            } catch (error) {
                next(error)
            }
        })
}

exports.signin = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new ErrorResponse('Please provide email and password', 400))
    try {
        const user = await User.findOne({ email }).select('+password')
        if (!user) return next(new ErrorResponse('Invalid Email', 401))
        const isMatch = await user.matchPasswords(password)
        if (!isMatch) return next(new ErrorResponse('Invalid Password', 401))
        sendToken(user, 200, res)
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
}

exports.forgotpassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email })
        if (!user) return next(new ErrorResponse('Email could not be sent', 404))
        const resetToken = user.getResetPasswordToken()
        await user.save()
        const resetUrl = `${process.env.URL}/passwordreset/${resetToken}`
        const message = `
            <h1>You Have Request a password reset</h1>
            <p>Please go to this link to reset your password</p>
            <a href=${resetUrl} >${resetUrl}</a>
        `
        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset Request",
                text: message
            })
            res.status(200).json({ success: true, data: "Email sent" })
        } catch (error) {
            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined
            await user.save()
            return next(new ErrorResponse("Email could not be send", 500))
        }
    } catch (error) {
        next(error)
    }
}

exports.resetpassword = async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex')
    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        })
        if (!user) return next(new ErrorResponse('Invaild Reset Token', 400))
        user.password = req.body.password
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save()
        res.status(201).json({ success: true, data: "Password Reset Success" })
    } catch (error) {
        next(error)
    }
}