const User = require('../models/user')
const ErrorResponse = require('../utlis/errorResponse')
const sendEmail = require('../utlis/sendEmail')
const crypto = require('crypto')
const shortid = require('shortid')


const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken()
    res.status(statusCode).json({ success: true, token })
}

exports.signup = async (req, res, next) => {
    User.findOne({ email: req.body.email })
        .exec(async (error, user) => {
            if (user) return next(new ErrorResponse('Admin already registered.', 400))
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


// exports.signin = (req, res) => {
//     User.findOne({ email: req.body.email })
//         .exec(async (error, user) => {
//             if (error) res.status(400).json({ error: error })
//             if (user) {
//                 const isPassword = await user.authenticate(req.body.password);
//                 if (isPassword && user.role === 'admin') {
//                     const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' })
//                     const { _id, firstName, lastName, email, role, fullName } = user
//                     res.cookie('token', token, { expiresIn: '1d' })
//                     res.status(200).json({
//                         token: token,
//                         user: {
//                             _id, firstName, lastName, email, role, fullName
//                         }
//                     })
//                 } else {
//                     res.status(400).json({ message: 'Invalid Password.' })
//                 }
//             } else {
//                 res.status(400).json({ message: 'Something went wrong.' })
//             }
//         })
// }


// exports.signout = (req, res) => {
//     res.clearCookie('token');
//     res.status(200).json({
//         message: 'Signout successfully...!'
//     })
// }


/*

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new ErrorResponse('Please provide email and password', 400))
    try {
        const user = await User.findOne({ email }).select('+password')
        if (!user) return next(new ErrorResponse('Invalid Creadentials', 401))
        const isMatch = await user.matchPasswords(password)
        if (!isMatch) return next(new ErrorResponse('Invalid Creadentials', 401))
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

const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken()
    res.status(statusCode).json({ success: true, token })
}

*/