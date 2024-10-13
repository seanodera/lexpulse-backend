


const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const postmark = require("postmark");
const { updateBalance } = require("../utils/helper");
const client = new postmark.ServerClient(process.env.POSTMARK_EMAIL_KEY);

// @desc Auth admin
// @route POST /api/v1/admin/auth
exports.checkAdmin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const admin = await User.findOne({ username }).exec();

        if (!admin) return res.status(400).json({ msg: 'Admin does not exist' });


        if (admin.activatedEmail === false) return res.status(400).json({ msg: 'Email not verified' });

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch || admin.userType !== 'administrator') return res.status(400).json({ msg: 'Invalid credentials' });
        console.log(admin);

        jwt.sign(
            { ...admin, userType: admin.userType, id: admin.id },
            process.env.JWT_SECRET,
            { expiresIn: '365d' },
            (err, token) => {
                if (err) throw err;

                return res.json({
                    token,
                    user: {
                        id: admin.id,
                        firstName: admin.firstName,
                        lastName: admin.lastName,
                        username: admin.username,
                        country: admin.country,
                        gender: admin.gender,
                        userType: admin.userType,
                        image: admin.image,
                        phone: admin.phone,
                        activatedEmail: admin.activatedEmail,
                        activatedPhone: admin.activatedPhone,
                        accountActive: admin.accountActive,
                        createdAt: admin.createdAt,
                    }
                });
            }
        );

    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);

            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    }
}

// @desc Auth admin confirm email
// @route POST /api/v1/admin/auth/confirm-code
exports.checkAdminVerification = async (req, res, next) => {
    try {
        const { username, code } = req.body;

        if (!username || !code) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        User.findOne({ username })
            .then(async (user) => {
                if (!user) return res.status(400).json({ msg: 'Admin does not exist' });

                const otpCode = await Otp.findOne({ userId: user.id });

                if (moment() > moment(otpCode.expiredAt)) return res.status(400).json({ msg: 'Code expired' });

                if (otpCode.activateCode !== Number(code)) return res.status(400).json({ msg: 'Invalid code' });

                const userNew = await User.findByIdAndUpdate(user._id, {
                    activatedEmail: true
                }, { new: true });

                jwt.sign(
                    { id: user.id },
                    process.env.JWT_SECRET,
                    { expiresIn: '7d' },
                    (err, token) => {
                        if (err) throw err;
                        res.json({
                            token,
                            user: {
                                id: userNew.id,
                                firstName: userNew.firstName,
                                lastName: userNew.lastName,
                                username: userNew.username,
                                country: userNew.country,
                                gender: userNew.gender,
                                userType: userNew.userType,
                                image: userNew.image,
                                organization: userNew.organization,
                                phone: userNew.phone,
                                activatedEmail: userNew.activatedEmail,
                                activatedPhone: userNew.activatedPhone,
                                accountActive: userNew.accountActive,
                                createdAt: userNew.createdAt
                            }
                        });
                    }
                );
            });

    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);

            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    }
}