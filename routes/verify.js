var User = require('../models/user');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config.js');

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};

exports.verifyOrdinaryUser = function (req, res, next) {
    console.log('Verify ordinary User');
    // check header or url parameters or post parameters for token
    var token = req.body.token;
    if (token) {
	var secretKey = "h7UDSB7iLiEg9GE0mYAdMlGaVVVM2DG2vydeyzct";
        decoded = jwt.decode(token);
        console.log(decoded);
	req.decoded = decoded;
	next();
        return 
    }
    token = null;
    token = req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};


exports.verifyAdmin = function(req, res, next) {
   console.log(req.decoded);
  if (req.decoded.admin == false) {
    // User not an admin
    var error = new Error('Not an admin.')
    error.status = 403
    next(error)
  } else {
    next()
  }
}
