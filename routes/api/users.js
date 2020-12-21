const express = require('express');
const router = express.Router()

const jwt = require('jsonwebtoken');
const key = require('../../config/key').secretKey;
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { ExtractJwt } = require('passport-jwt');


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


// @route   GET api/users/Login
// @desc    Login User
// @access  Public

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({email})
        .then(user => {
            if(!user){
                return res.status(404).json({ email: "User not found"})
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch){
                    // user matched
                    const payload = { id: user.id, name: user.name, avatar: user.avatar }
                    
                    // Sign Token
                    jwt.sign(
                        payload,
                        key,
                        {expiresIn: 3600 },
                        (err, token) => {
                            res.json({
                                success: true,
                                token: 'Bearer ' + token
                            });
                        });
                        
                    }else{
                        res.status(400).json({ password: "Password incorrect"})
                    }

                })
        })
})

module.exports = router;