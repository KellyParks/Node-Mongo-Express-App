const express = require('express'); //get the express module, which exports a function
const app = express(); //call the function and store it's result so we can start using it
const bodyParser = require('body-parser'); //middleware to help cleanup a request object so it's easier to use
const MongoClient = require('mongodb').MongoClient;

const connectionString = 'mongodb+srv://sampleProject:summer2020@sampleproject-so3lj.mongodb.net/test?retryWrites=true&w=majority';
MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to DB');
        const db = client.db('star-wars-quotes');
        const quotesCollection = db.collection('quotes');

        app.set('view engine', 'ejs');
        /*express' use method let's us use middleware with express.
        urlencoded() tells bodyParser to extract data from the <form> element on index.html and add them
        to the body property in the request object. */
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
        app.use(express.static('public'));

        app.get('/', (request, response) => {
            db.collection('quotes').find().toArray()
                .then(results => {
                    response.render('index.ejs', {quotes: results})
                })
                .catch(error => console.error(error));
        });

        app.post('/quotes', (request, response) => {
            quotesCollection.insertOne(request.body)
            .then(result => {
                response.redirect('/');
            })
            .catch(error => console.error(error));
        });

        app.put('/quotes', (request, response) => {
            quotesCollection.findOneAndUpdate(
                { name: 'Yoda' },
                {
                    $set: {
                        name: request.body.name,
                        quote: request.body.quote
                    }
                },
                {
                    upsert: true
                }
            ).then(result => {
                response.json('Success');
            })
            .catch(error => console.error(error))
        });

        app.delete('/quotes', (req, res) => {
            quotesCollection.deleteOne(
                { name: req.body.name }
            ).then(result => {
                if (result.deletedCount === 0){
                    return res.json('No quote to delete');
                }
                res.json('Deleted Darth Vader\'s quote');
            })
            .catch(error => console.error(error))
        })

        app.listen(3000, function(){
            console.log('listening on port 3000');
        });

    }).catch(error => console.log(error));
