const { application } = require("express");
const express = require("express");
const router = express.Router();

var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://mqtt:1883');

var mongoose = require('mongoose');
var mongooseurl = 'mongodb://mongodb:27017/users'
// users is the database in mongo where we connect to

const User = require('../../model/User');

// connect to db
mongoose.connect(mongooseurl, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;
connection.once("open", function() {
  console.log("MongoDB database connection established successfully"); 
});

//const uuid = require("uuid");
// can be used to generte a unique number - this sample works only with integer numbers


/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
 function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    );
}
router.get('/ticketsystem', (req, res) =>  {
  if(!req.session.user) {
    return res.status(401).send();
  } 
  return res.status(200).send("logged in");
})

router.get("/", async(req, res) => {
  console.log("find all docs in mongodb");
  alldocs = await User.find({}).exec();
  return res.status(200).send(alldocs);
});

  
router.get ('/:userid/', async(req, res) => {
  //console.log("reg =", req);
  userid=(req.params.userid);
  console.log("userid = ", userid);
  
  User.findOne({userid: userid}, function(err,docs) {
    if (err) {
      console.log(err);
      return res.sendStatus(400);
    }
    else {
      console.log("user document = ", docs);
    }
    return res.status(200).send(docs);
  });
});

router.post("/", async(req, res) => {
  const newUser = {
    id: between(10,100000),
    //id: uuid.v4()
    userid: req.body.userid,
    name: req.body.name,
    vorname: req.body.vorname,
    street: req.body.street,
    no: req.body.no,
    city: req.body.city,
    email: req.body.email,
    password: req.body.password
  };
  // check if userid already exist
  const duplicate = await User.findOne({userid: newUser.userid}).exec();
  if (duplicate) {
    return res.status(409).json({message: 'user exists already'});
  } else {
    await User.insertMany(newUser, function(err, result) {
      if(err) {
        console.log(err);
        return res.sendStatus(400);
      } else {
        console.log("save data successful");
        return res.status(200).json({message: newUser});
      }
    });
  }
});

//Update User

router.put("/:userid", async(req, res) => {
 
  const found = await User.findOne({userid: req.body.userid}).exec();
  console.log(found);
  if (found) {
    const updateUser = req.body;
    await User.updateOne({userid: req.body.userid}, {name: req.body.name}).exec();
  }
  return res.sendStatus(200);
}); 

//Delete User

router.delete("/:id", (req, res) => {
  const found = users.some(user => user.id === parseInt(req.params.id))
  if (found) {
    users = users.filter(user => user.id !== parseInt(req.params.id))
    res.json({
      msg: "User deleted",
      users
    });
  } else {
    res.sendStatus(400);
  }

});
/************************************************************/
/* handle log in
/************************************************************/
router.post('/login', (req,res) => {
  var userid = req.body.userid;
  var password = req.body.password;

  const found = users.find((user => user.userid === userid) && (user => user.password === password));

    if(!found) {
      console.log('no such userid/password');
      return res.status(404).send();
    }
    req.session.user = users;
    return res.status(200).send('userid and password defined');
});

module.exports = router;