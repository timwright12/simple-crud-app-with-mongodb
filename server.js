require('dotenv').config();
const express = require('express');
const bodyParser= require('body-parser')
const app = express();

// @TODO: replace MongoClient with Mongoose
const MongoClient = require('mongodb').MongoClient;

const connectionString = process.env.CONNECTION_STRING;

// Tell our server what it should support
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json())

// Connect to MongoDB
MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    const db = client.db('star-wars');
    const quotesCollection = db.collection('quotes')

    // Make sure you place body-parser before your CRUD handlers!
    app.use(bodyParser.urlencoded({
      extended: true
    }));

    // Handle get request
    app.get('/', (req, res) => {
      db.collection('quotes').find().toArray()
        .then(results => {
          // console.log(results)
          res.render('index.ejs', { quotes: results })
        })
        .catch(error => console.error(error));
    })
    
    // Handle post request
    app.post('/quotes', (req, res) => {
      quotesCollection.insertOne(req.body)
        .then(result => {
          res.redirect('/');
        })
        .catch(error => console.error(error))
    });

    // Update action
    app.put('/quotes', (req, res) => {
      quotesCollection.findOneAndUpdate(
        { name: 'Yoda' },
        {
          $set: {
            name: req.body.name,
            quote: req.body.quote
          }
        },
        {
          upsert: true
        }
      )
      .then(result => {
        res.json('Success')
       })
      .catch(error => console.error(error))
    });

    // Delete action
    app.delete('/quotes', (req, res) => {
      quotesCollection.deleteOne({ name: req.body.name })
        .then(result => {
          if (result.deletedCount === 0) {
            return res.json('No quote to delete')
          }
          res.json(`Deleted Darth Vader's quote`)
        })
        .catch(error => console.error(error))
    })

    // Start our application on port 3000
    app.listen(3000, function() {
      console.log('listening on 3000')
    });

  })
