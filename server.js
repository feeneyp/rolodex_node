var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const express = require('express');
const bodyParser= require('body-parser');
const app = express();
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
var db;

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
//the following lines for runing javascript in your html from server.js
// app.use(function(req,res,next){
//   res.locals.alertme = alertme;
//   next();
// })

MongoClient.connect('mongodb://p:123@ds017776.mlab.com:17776/star-wars-quotes1', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(3000, () => {
  console.log('listening on 3000')
  })
})

//to call a function from index.ejs define it here
// function alertme() {
//   console.log('boo')
//   return ('this h3 heading has been changed from servejs')
  
// }


function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the login page
    res.redirect('/login');
}


app.get('/', (req, res) => {
  personSelected = 0;
  db.collection('persons').aggregate({ $sort: {name: 1}}, (err,results) => {
  console.log('app.get results is: '+results)
  res.render('index.ejs', {results: results, personSelected:personSelected});
  });
});


app.get('/display/:personSelected', (req, res) => {
  personSelected = req.params.personSelected;
  console.log('/display/:personSelected is: '+personSelected);
  db.collection('persons').aggregate({ $sort: {name: 1}}, (err,results) => {
  console.log(':personSelected name is: '+ results[personSelected].name);
  res.render('index.ejs', {results: results, personSelected:personSelected});
  });
});

app.get('/update/:personSelected', (req, res) => {
  personSelected = req.params.personSelected;
  console.log('/update/:personSelected called with personSelected: '+personSelected);
  db.collection('persons').aggregate({ $sort: {name: 1}}, (err,results) => {
  console.log(':personSelected for the update is named: '+ results[personSelected].name);
  res.render('update.ejs', {results: results, personSelected:personSelected});
  });
});


app.post('/create', (req, res) => {
  db.collection('persons').save(req.body, (err, result) => {
    if (err) return console.log(err);
    console.log('app.post new person saved to database: ' + req.body.name);
    res.redirect('/');
  })
})



app.delete('/delete', (req, res) => {
  console.log("delete request handler called");
  db.collection('persons').findOneAndDelete({name: req.body.name}, (err, result) => {
    if (err) return console.log(err);
  })
})

app.post('/update', (req, res) => {
  console.log('/update request handler called to update with req: '+JSON.stringify(req.body));
  db.collection('persons').findOneAndUpdate({name: req.body.name},{$set: {name:req.body.setName, email:req.body.setEmail, address:req.body.setAddress}}, (err, result) => {
    if (err) return console.log(err);
    //$set is a mongoDB operator for setting new value.  there is also $unset for deleting
  })
})


app.get('/sort', (req, res) => {
  console.log("/sort request handler called");
  db.collection('persons').aggregate({ $sort: {name: -1}}, (err,results) =>{
    console.log('app /sort results: ' + JSON.stringify(results));
    res.render('index.ejs', {results: results});
  })
})

app.get('/login', function(req, res) {
  console.log('app get login loads: ' + path.join(__dirname, '../rolodex_node/public/login.html'));
  res.sendFile(path.join(__dirname, '../rolodex_node/public/login.html'));
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/loginSuccess',
    failureRedirect: '/loginFailure'
  })
);


app.get('/loginFailure', function(req, res, next) {
  res.send('Failed to authenticate');
});


app.get('/loginSuccess', function(req, res, next) {
  console.log('passport app post /login auth and /loginsuccess called');
  res.redirect('/');
});

passport.use(new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
    db.collection('userInfo').findOne({
      'username': username, 
    }, function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      if (user.password != password) {
        return done(null, false);
      }

      return done(null, user);
    });
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});



