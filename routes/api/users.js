const express = require('express');
const router = express.Router()

const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');


// @route   GET api/users/test
// @desc    Test users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: "users works!" }) )


// @route   GET api/users/register
// @desc    Register User
// @access  Public

router.post('/register', (req, res) => {
    // check email is exist or not
    User.findOne({email: req.body.email })
        .then(user => {
            if(user){   // thow error if exist
                return res.status(400).json({email: 'Email is already exists.'})
            }else{ // or save the user to db
                
                const avatar = gravatar.url(req.body.email, {
                    s: '200',   // size
                    r: 'pg',    // rating
                    d: 'mm'     //Default
                })
                
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });
                
                // generate salt and hash password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err,hash) => {
                        if(err) throw err;
                        newUser.password = hash
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))

                    })
                })
            }
        })
});

module.exports = router;