const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const HomePageContents = require('../models/HomePageContents');
const prisma = require('../models/prismaClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs')

// // Configure multer for file upload
// const upload = multer({
//     storage: multer.diskStorage({
//         destination: (req, file, cb) => {
//             const uploadPath = path.join(__dirname, '../uploads/user_photos');
//             // Ensure the directory exists
//             fs.mkdirSync(uploadPath, { recursive: true });
//             cb(null, uploadPath);
//         },
//         filename: (req, file, cb) => {
//             const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//             const ext = path.extname(file.originalname);
//             cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//         }
//     }),
//     fileFilter: (req, file, cb) => {
//         // Validate file type (optional)
//         const allowedTypes = /jpeg|jpg|png/;
//         const ext = path.extname(file.originalname).toLowerCase();
//         if (!allowedTypes.test(ext)) {
//             return cb(new Error('Only .jpeg, .jpg, and .png files are allowed.'));
//         }
//         cb(null, true);
//     }
// }).single('photo'); // Expecting a single file input named "photo"

const uploadHomeContentImage = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join(__dirname, '../uploads/home_contents');
            fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, `homeContent-${uniqueSuffix}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedTypes.test(ext)) {
            return cb(new Error('Only .jpeg, .jpg, and .png files are allowed.'));
        }
        cb(null, true);
    }
}).single('image'); // Expecting a single image file with key "image"



const register = async (req, res) => {


    // Access form data
    const { name, email, password, mobile, role } = req.body;

    // Validate input fields
    if (!name || !email || !password) {
        return res.status(400).json({
            message: 'All fields are required: name, email, and password.',
        });
    }

    try {
        // Check if email already exists in the database
        const existingUser = await userModel.checkEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
        }

        const transaction = await prisma.$transaction(async (prismaTx) => {
            // upload(req, res, async (err) => {
            //     if (err) {
            //         return res.status(400).json({ message: err.message });
            //     }
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            const userNames = name.split(" ");
            const firstUserName = userNames[0];
            const userName = firstUserName + '.' + mobile.substring(0, 3);

            // Prepare metadata for the new user
            const metaData = {
                name,
                email,
                password: hashedPassword,
                userName,
                mobile,
            };

            // Create the new user
            const newUser = await userModel.createUser(prismaTx, metaData);

            if (role === 'Admin') {
                // Assign Admin role
                await assighnRole(prismaTx, newUser.id, 'Admin');
            }

            return newUser;
            // });
        });
        console.log('transaction', transaction);

        // Handle file upload after user creation
        // let photoPath = null;
        // if (req.file) {
        //     const uploadPath = path.join(__dirname, '../uploads/user_photos');
        //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        //     const ext = path.extname(req.file.originalname);
        //     const fileName = `${req.file.fieldname}-${uniqueSuffix}${ext}`;
        //     photoPath = `/uploads/user_photos/${fileName}`;

        //     // Save file to the destination
        //     const fileDestination = path.join(uploadPath, fileName);
        //     fs.mkdirSync(uploadPath, { recursive: true });
        //     fs.writeFileSync(fileDestination, req.file.buffer);
        // }

        // // Update user record with photo path
        // if (photoPath) {
        //     await prisma.user.update({
        //         where: { id: transaction.id },
        //         data: { photo: photoPath },
        //     });
        // }

        // Success response
        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: transaction.id.toString(),
                name: transaction.name,
                email: transaction.email,
            },
        });
    } catch (error) {
        console.error('Error in register:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};


// Function to assign role
const assighnRole = async (prismaTx, userId, role) => {
    try {
        // Assign the specified role to the user
        await prismaTx.user.update({
            where: {
                id: userId,
            },
            data: {
                userType: role,
            },
        });
    } catch (error) {
        console.error('Error assigning role:', error);
        throw new Error('Server error while assigning role');
    }
};



const getAllUsers = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await prisma.$queryRaw`
        SELECT CAST(id AS CHAR) AS id, name, email FROM users
      `;
        console.log('users', users);

        res.status(200).json({
            status: true,
            message: 'Users fetched successfully',
            data: users,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            status: false,
            message: 'Server error while fetching users',
        });
    }
};

const getAllUserById = async (req, res) => {
    try {
        const userId = req.body.id;  // Get the ID from the request body
        const { id, name, email, password, mobile } = req.body;
        // Use Prisma's findUnique method to fetch the user by ID
        const user = await prisma.user.findUnique({
            where: {
                id: userId,  // Make sure the ID is a BigInt (or adjust based on your DB schema)
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            status: true,
            message: 'User fetched successfully',
            data: user,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            status: false,
            message: 'Server error while fetching user',
        });
    }
};
const updateUserById = async (req, res) => {
    try {
        const { id, name, email, password, mobile } = req.body; // Destructure the request body
        // Update the user details in the database
        // console.log('ascsaving',req.body)
        const updatedUser = await prisma.user.update({
            where: {
                id: id,  // Use the ID from the request body
            },
            data: {
                name: name,  // Update name
                email: email,  // Update email
                mobile: mobile,  // Update mobile if provided
            },
        });

        if (!updatedUser) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            status: true,
            message: 'User updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            status: false,
            message: 'Server error while updating user',
        });
    }
};
const addHomeContents = async (req, res) => {
    uploadHomeContentImage(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { title, description } = req.body;
            console.log('req.body', req.body);
            if (!title || !description) {
                return res.status(400).json({ message: 'All fields are required: title and description.' });
            }

            let imagePath = null;
            if (req.file) {
                imagePath = `/uploads/home_contents/${req.file.filename}`;
            }

            const addHomeContent = await prisma.homePageContents.create({
                data: {
                    title,
                    description,
                    image: req.file ? req.file.filename : null,
                    image_path: imagePath,
                },
            });

            res.status(201).json({
                status: true,
                message: 'Home Content added successfully',
                data: addHomeContent,
            });
        } catch (error) {
            console.error('Error adding home content:', error);
            res.status(500).json({
                status: false,
                message: 'Server error while adding home content',
            });
        }
    });
};

module.exports = { register, getAllUsers, getAllUserById, updateUserById, assighnRole, addHomeContents };
