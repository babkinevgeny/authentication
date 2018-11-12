const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;
//const assert = require('assert');
const path = require('path');
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');

const url = 'mongodb://localhost:27017/users';

const client = new MongoClient(url, { useNewUrlParser: true });

let db;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.static('files'));

app.use('/static', express.static('public'));

app.use(
  session({
    secret: 'alahamora',
    store: new FileStore(),
    cookie: {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    },
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  console.log('Serialization: ', user)
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  console.log('Deserialization: ', id);
  db.collection('users').findOne({_id: ObjectID(id)}, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({ usernameField: 'email' },
  function(email, password, done) {
    db.collection('users').findOne({ email: email }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      if (user.password != password) {
        return done(null, false);
      }
      return done(null, user);
    });
  }
));




//Checking of authentication
const auth = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
};

//Get basic page
app.get('/static/appointment', auth, function (req, res) {
  res.sendFile(path.join(__dirname, '/public', 'appointment.html'));
});

//Get admin page
// app.get('/admin', auth, function (req, res) {
//   res.send('Admin page');
// });

//Login
app.post('/login', function (req, res, next) {
  passport.authenticate('local', function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send('Wrong email or password!');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/static/appointment');
    });
  })(req, res, next);
});


const checkEmail = function (req, res, next) {
  db.collection('users').findOne({email: req.body.email}, function(err, doc) {
    if (err) {
      return console.log(err);
    }
    if (doc) {
      return res.send('This email has been already used!');
    }
    next();
  });
};
//Create new user
app.post('/users/new', checkEmail, function (req, res) {
  let user = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  };
  db.collection('users').insertOne(user, function (err, result) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    res.send(user);
  });
});


//Get all users
app.get('/users', function(req, res) {
  db.collection('users').find().toArray(function (err, docs) {
    if (err) {
      console.log(err)
      return res.sendStatus(500);
    }
    res.send(docs);
  })
});


//Remove user by ID
app.delete('/users', function (req, res) {
  db.collection('users').deleteOne({_id: ObjectID(req.body._id) }, function (err, result) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    res.send('Deleted');
  });
})


//Connect our server and create database
client.connect(function (err, database) {
  if (err) {
    return console.log(err);
  }
  db = client.db('users');
  app.listen(3000, function() {
    console.log('Working...');
  });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
