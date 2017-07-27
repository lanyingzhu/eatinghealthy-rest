var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');

var User = require('../models/user');
var Verify = require('./verify');
var url = require('url');
User = User.UsersDB;

var router = express.Router();

var users = new Array();
User.list({include_docs: true}, function (err, data) {
  if (err) {
      console.log("get user list error: " + err);
  }
  for (var i=0; i<data.rows.length; i++) {
      console.log(data.rows[i].doc);
      users.push({"username": data.rows[i].doc["username"],
                  "password": data.rows[i].doc["password"]});
  }
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  //res.send('respond with a resource');
    var _users = new Array();
    for (i=0; i<users.length; i++) {
        _users.push(users[i].username);
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(_users);
});

router.get('/register', function (req, res) {
    var regInfo = url.parse(req.url, true).query;
    console.log(regInfo);
    var user = {username: regInfo.username, password: regInfo.password};
    if(regInfo.email) {
        user.email = regInfo.email;
    }
    for (i=0; i<users.length; i++) {
        console.log("username: " + users[i].username);
        if (regInfo.username === users[i].username) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.status(400).json({
                err: {message: "user <b>" + regInfo.username + "</b> is existed"}
            });
        }
    }
    User.insert(user, function(err, user) {
        if (err) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.status(500).json({err: err});
        }
        console.log("added user: " + user);
        users.push({'username': regInfo.username, 'password': regInfo.password});
        res.setHeader('Access-Control-Allow-Origin', '*');
		return res.status(200).json({status: 'Registration Successful!'});
    });
});

router.get('/login', function (req, res, next) {
  var loginData = url.parse(req.url, true).query;
  console.log(loginData);

  for (i=0; i<users.length; i++) {
      console.log("username: " + users[i].username);
      if (loginData.username === users[i].username) {
        if (loginData.password === users[i].password) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            console.log(res.headers);
            return res.status(200).json({
				status: 'Login successful!',
                success: true});
        }
      }
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(401).json(
    {err: {message: 'Unauthorized or Non-existed user!', name: loginData.username}});
});

router.get('/logout', function(req, res) {
    req.logout();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      status: 'Bye!'
    });
});

router.get('/facebook', passport.authenticate('facebook'),
  function(req, res){});

router.get('/facebook/callback', function(req,res,next){
  passport.authenticate('facebook', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      var token = Verify.getToken(user);

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req,res,next);
});


module.exports = router;
