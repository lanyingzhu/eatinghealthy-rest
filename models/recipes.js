// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a sub-schema
var commentSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: false
    },
    comment:  {
        type: String,
        required: true
    },
    author:  {
        type: String,
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// create a schema
var recipeSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    likeNumber: {
        type: Number,
        required: true,
        unique: true
    },
    ingredient: {
        type: String,
        required: true
    },
    direction: {
        type: String,
        required: true
    },
    area: {
        type: String,
        required: true
    },
    comments:[commentSchema]
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
var Recipes = mongoose.model('Recipe', recipeSchema);

// make this available to our Node applications
module.exports = Recipes;

