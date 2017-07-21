var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var cfenv = require('cfenv');

var User = new Schema({
    username: String,
    password: String,
    OauthId: String,
    OauthToken: String,
    firstname: {
      type: String,
      default: ''
    },
    lastname: {
      type: String,
      default: ''
    },
    admin:   {
        type: Boolean,
        default: false
    }
});

User.methods.getName = function() {
    return (this.firstname + ' ' + this.lastname);
};

User.plugin(passportLocalMongoose);


// The codes below use ibm bluemix cloudantNoSQLDB

var UsersDB;

// load local VCAP configuration  and service credentials
var vcapLocal;
try {
  vcapLocal = require('../vcap-local.json');
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) { }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}

const appEnv = cfenv.getAppEnv(appEnvOpts);
console.log("appEnv = " + JSON.stringify(appEnv));

if (appEnv.services['cloudantNoSQLDB']) {
  // Load the Cloudant library.
  var Cloudant = require('cloudant');

  // Initialize database with credentials
  var cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);

  //database name
  var UsersDBName = 'users';

  // Create a new "UsersDB" database.
  cloudant.db.create(UsersDBName, function(err, data) {
    if(!err) //err if database doesn't already exists
      console.log("Created database users: " + UsersDBName);
  });

  // Specify the database we are going to use (mydb)...
  UsersDB = cloudant.db.use(UsersDBName);
}

if (!UsersDB) {
  console.log("NO DATABASE UsersDB");
}

module.exports = {"User": mongoose.model('User', User), "UsersDB": UsersDB};
