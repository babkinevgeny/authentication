const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');

const url = 'mongodb://localhost:27017/users';

const client = new MongoClient(url, { useNewUrlParser: true });

let db;

const app = express();

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



//Middlewares

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.static('files'));

app.use('/', express.static('public'));
app.set('view engine', 'pug');

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
    saveUninitialized: true
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

const auth = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
};

const checkEmail = function (req, res, next) {
  db.collection('users').findOne({email: req.body.email}, function(err, doc) {
    if (err) {
      return console.log(err);
    }
    if (doc) {
      return res.render('global/plug', {h1: 'This email has been already used'});
    }
    next();
  });
};



//Routing

app.get('/account', auth, function (req, res) {
  res.render('global/account');
});

app.post('/login', function (req, res, next) {
  passport.authenticate('local', function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render('global/plug', {h1: 'Wrong email or password'});
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/account');
    });
  })(req, res, next);
});

app.get('/', function(req, res){
  res.render('global/index', {title: 'Barbershop'});
});

app.post('/users/new', checkEmail, function (req, res) {
  let user = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    appointment: ''
  };
  db.collection('users').insertOne(user, function (err, result) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    res.render('global/plug', {h1: 'Thank you for registration. So now sign in'});
  });
});

app.get('/users', function(req, res) {
  db.collection('users').find().toArray(function (err, docs) {
    if (err) {
      console.log(err)
      return res.sendStatus(500);
    }
    res.send(docs);
  })
});

app.delete('/users', function (req, res) {
  db.collection('users').deleteOne({_id: ObjectID(req.body._id) }, function (err, result) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    res.send('Deleted');
  });
})

app.post('/appointment' , function(req, res) {
  db.collection('users').updateOne({_id: ObjectID(req.session.passport.user)}, {
    $set: {
      appointment: {
        day: req.body.day,
        time: req.body.time,
        barber: req.body.barber,
        services: req.body.services
      }
    }
  }, {upsert: true});
  req.logout();
  res.render('global/plug', {h1: 'We will wait you. See you'});
});

app.get('/logout', function(req, res){
  req.logout();
  res.render('global/plug', {h1: 'See you'});
});
