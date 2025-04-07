const prisma = require('./prismaClient');


// Function to add home page contents
const addHomeContents = async (metaData) => {
    try {
        const addHomeContents = await HomePageContents.create({
            data: {
                title: metaData.title,
                description: metaData.description,
                image: metaData.image,
                image_path: metaData.image_path,
            }
        });
        return addHomeContents;  // Return the newly created user
    } catch (error) {
        throw error;  // Handle any database errors
    }
};

module.exports = { addHomeContents };
