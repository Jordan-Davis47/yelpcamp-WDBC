const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '61f01c7ac0b3b59c86d1d69c',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dcgaqgcws/image/upload/v1643822155/YelpCamp/sofwdpzf4nbgfr6mdw8j.jpg',
                    filename: 'YelpCamp/sofwdpzf4nbgfr6mdw8j'
                },
                {
                    url: 'https://res.cloudinary.com/dcgaqgcws/image/upload/v1643822154/YelpCamp/jvgg09gdgdcet1avuzyt.jpg',
                    filename: 'YelpCamp/jvgg09gdgdcet1avuzyt'
                }
            ],
            description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dignissimos sit minus nobis. Eligendi harum natus quasi, nemo quod fuga, sapiente esse impedit maiores earum accusantium eius magni consequatur voluptas possimus.",
            price
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})