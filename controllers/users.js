const User = require('../models/user');

module.exports.renderRegister = (req, res) => { 
    res.render('users/register')
}

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => { 
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
        
    } catch (err) {
        if (err.message = 'E11000 duplicate key error collection: yelp-camp.users index: email_1 dup key:') { 
            err.message = 'A user with that given email address already exists';
        }
        
        req.flash('error', err.message);
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    const returnUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    req.flash('success', 'Welcome back');
    console.log(returnUrl);
    res.redirect(returnUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
}