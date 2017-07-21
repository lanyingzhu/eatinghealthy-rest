// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var cfenv = require('cfenv');

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


// The codes below use ibm bluemix cloudantNoSQLDB
var RecipesDB;

// load local VCAP configuration  and service credentials
var vcapLocal;
try {
  vcapLocal = require('../vcap-local.json');
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) { console.log(e); }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}

const appEnv = cfenv.getAppEnv(appEnvOpts);

if (appEnv.services['cloudantNoSQLDB']) {
  // Load the Cloudant library.
  var Cloudant = require('cloudant');

  // Initialize database with credentials
  var cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);

  //database name
  var RecipesDBName = 'recipes';

  // Create a new "RecipesDB" database.
  cloudant.db.create(RecipesDBName, function(err, data) {
    if(!err) //err if database doesn't already exists
      console.log("Created database recipes: " + RecipesDBName);
  });

  // Specify the database we are going to use (mydb)...
  RecipesDB = cloudant.db.use(RecipesDBName);
}

if (!RecipesDB) {
  console.log("NO DATABASE RecipesDB");
}

// the schema is useless so far
// we need to create a model using it
var Recipes = mongoose.model('Recipe', recipeSchema);

// make this available to our Node applications
module.exports = {"Recipes": Recipes, "RecipesDB": RecipesDB};

