const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const prisma = require('../models/prismaClient');
const crypto = require('crypto'); // To generate a secure rememberToken


// User login
const login = async (req, res) => {
    const { email, password } = req.body;
    // Validate input fields
    if (!email || !password) {
        return res.status(400).json({
            message: 'All fields are required: name, email, and password.'
        });
    }
    try {
        const user = await userModel.getUserByEmail(email);

        // console.log('cac',user)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // const userId = user.id.toString(); // or use `.toNumber()` if a regular number is preferred

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Generate and save a rememberToken
        // console.log('userId',user.id)
        const rememberToken = crypto.randomBytes(32).toString('hex');
        await userModel.updateRememberToken(user.id, rememberToken);
        const metaData = {
            user:user.id,
            token,
        };
        console.log('sdvbsjdv',metaData)
        res.status(200).json({ status: true, message: 'Login successful', metaData });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ status: false, message: 'Server error', error });
    }
};
//  logout funtion os users 
const logout = async (req, res) => {
    try {
        const userId = req.user.id;

        // Assuming `req.user.id` contains the authenticated user's ID from middleware
        // Invalidate the rememberToken by setting it to null
        await prisma.user.update({
            where: {
                id: userId, // Match the user by ID
            },
            data: {
                rememberToken: null, // Set rememberToken to null
            },
        });

        res.status(200).json({
            status: true,
            message: 'Logout successful',
        });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({
            status: false,
            message: 'Server error during logout',
        });
    }
};



module.exports = { login, logout };
