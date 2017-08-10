var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Recipes = require('../models/recipes');
var Verify = require('./verify');
Recipes = Recipes.RecipesDB;

var recipeRouter = express.Router();
recipeRouter.use(bodyParser.json());
recipeRouter.route('/')

    .get(function (req,res,next){
        Recipes.list({include_docs: true}, function (err, recipe) {
            if (err) next(err);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.json(recipe);
        });
    })

    .post(function (req, res, next){
        Recipes.insert(req.body, function (err, recipe) {
            console.log(req.body);
            if (err) next(err);
            console.log('Recipe created!');
            var id = recipe._id;

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the recipe with id: ' + id);
        });
    })

    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next){
        Recipes.destroy({}, function (err, resp) {
            if (err) next(err);
            console.log("hello")
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.json(resp);
        });
    })

    .options(function (req,res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
        res.json();
    });

recipeRouter.route('/:recipeId')

    .get(function(req,res,next){
        console.log(req.params.recipeId);
        Recipes.get(req.params.recipeId, function (err, recipe) {
            if (err) next(err);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.json(recipe);
        });
    })

    .put(function(req, res, next){
        console.log(req.body);
        console.log(req.params.recipeId);
        Recipes.get(req.params.recipeId, function (err, recipe) {
            if (err) next(err);
            console.log(recipe);
            recipe.likeNumber = parseInt(req.body.likeNumber);

            Recipes.insert(recipe, function (err, recipe) {
                if (err) next(err);
                Recipes.get(req.params.recipeId, function (err, recipe) {
                    if (err) next(err);
                    console.log(recipe);
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.json(recipe);
                });
            });
        });
    })

    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
        Recipes.get(req.params.recipeId, function(err, data)  {
            if (err) {
                console.log("No found recipe");
                return;
            }
            Recipes.destroy(data._id, data._rev, function (err, resp) {
                if (err) next(err);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.json(resp);
            });
        });
    })

    .options(function (req,res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
        res.json();
    });


recipeRouter.route('/:recipeId/comments')

    .get(function (req, res, next) {
        Recipes.get(req.params.recipeId, function (err, recipe) {
            if (err) next(err);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.json(recipe.comments);
        });
    })

    .post(Verify.verifyOrdinaryUser, function (req, res, next) {
        Recipes.get(req.params.recipeId, function (err, recipe) {
            console.log(req.params.recipeId);
            if (err) next(err);
            console.log(req.decoded);

            req.body.postedBy = req.decoded._id;

            recipe.comments.push(req.body);
            Recipes.insert(recipe, function (err, data) {
                if (err) next(err);
                console.log('Updated Comments!');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.json(data);
            });
        });
    })

    .delete(Verify.verifyAdmin, function (req, res, next) {
        Recipes.get(req.params.recipeId, function (err, recipe) {
            if (err) next(err);
            for (var i = (recipe.comments.length - 1); i >= 0; i--) {
                recipe.comments.id(recipe.comments[i]._id).remove();
            }
            Recipes.insert(recipe, function (err, result) {
                if (err) next(err);
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                res.end('Deleted all comments!');
            });
        });
    })

    .options(function (req,res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
        res.json();
    });

recipeRouter.route('/:recipeId/comments/:commentId')

    .get(function (req, res, next) {
        Recipes.get(req.params.recipeId, function (err, recipe) {
            if (err) next(err);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.json(recipe.comments.id(req.params.commentId));
        });
    })

    .put(Verify.verifyOrdinaryUser, function (req, res, next) {
        // We delete the existing commment and insert the updated
        // comment as a new comment
        Recipes.get(req.params.recipeId, function (err, recipe) {
            if (err) next(err);
            if (recipe.comments.id(req.params.commentId).postedBy
               != req.decoded._id) {
                var err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }
            recipe.comments.id(req.params.commentId).remove();
            recipe.comments.push(req.body);
            Recipes.insert(recipe, function (err, data) {
                if (err) next(err);
                console.log('Updated Comments!');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
                res.json(data);
            });
        });
    })

    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Recipes.get(req.params.recipeId, function (err, recipe) {
            if (recipe.comments.id(req.params.commentId).postedBy
               != req.decoded._id) {
                var err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }

            recipe.comments.id(req.params.commentId).remove();
            Recipes.insert(recipe, function (err, resp) {
                if (err) next(err);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.json(resp);
            });
        });
    })

    .options(function (req,res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
        res.json();
    });

module.exports = recipeRouter;
