const prisma = require('./prismaClient');

// Get user by email using Prisma
const getUserByEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        return user;  // If no user found, it will return null
    } catch (error) {
        throw error;  // Handle any database errors
    }
};

const updateRememberToken = async (userId, token) => {
    try {
        // Update the rememberToken for the user with the given userId
        await prisma.user.update({
            where: {
                id: userId, // Match the user by ID
            },
            data: {
                rememberToken: token, // Update the rememberToken field
            },
        });
    } catch (error) {
        console.error('Error updating rememberToken:', error);
        throw error;
    }
};


// Add new user using Prisma
// Function to create user
const createUser = async (prismaTx, metaData) => {
    try {
        const newUser = await prismaTx.user.create({
            data: {
                name: metaData.name,
                email: metaData.email,
                password: metaData.password,
                user_name: metaData.userName,
                mobile: metaData.mobile,
                photo: metaData.photo,
                createdAt: new Date()  // Optionally set createdAt if not set by default
            }
        });
        return newUser;  // Return the newly created user
    } catch (error) {
        throw error;  // Handle any database errors
    }
};

// Check if email exists in the database using Prisma
const checkEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // If a user is found, return the user object; otherwise, return null
        return user ? user : null;
    } catch (error) {
        throw error;  // Handle any database errors
    }
};

module.exports = { getUserByEmail, createUser, checkEmail ,updateRememberToken };
