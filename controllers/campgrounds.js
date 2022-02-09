const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });



module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('./campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('./campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({ //forward geocode turns location string into long, lat coord//
        query: req.body.campground.location, //location name//
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry; //get geometry from geometry body//
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename})) //.map over req.files and use implicit return to create object // 
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) { 
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds');
    }
    res.render('./campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) { 
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds');
    }
    res.render('./campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) { 
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename); //delete images from cloudinary//
            
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }) //pull from images array all images where the filename of that image is $in the deleteImages array //
        console.log(campground);
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
}