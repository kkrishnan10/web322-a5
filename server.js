/********************************************************************************
*  WEB322 – Assignment 05
*
*  I declare that this assignment is my own work and completed based on my
*  current understanding of the course concepts.
*
*  The assignment was completed in accordance with:
*  a. The Seneca's Academic Integrity Policy
*     https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
*  b. The academic integrity policies noted in the assessment description
*
*  I did NOT use generative AI tools (ChatGPT, Copilot, etc) to produce the code
*  for this assessment.
*
*  Name: Karthika Krishnan           Student ID: 101801231
*
********************************************************************************/
require('dotenv').config();
const HTTP_PORT = process.env.PORT || 8080;

const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.set('views', __dirname + '/views');
require('pg');

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);


const Memory = sequelize.define('memory', {
  name:      { type: DataTypes.TEXT, allowNull: false },
  address:   { type: DataTypes.TEXT, allowNull: false },
  category:  { type: DataTypes.TEXT, allowNull: false },
  comments:  { type: DataTypes.TEXT, allowNull: false },
  image:     { type: DataTypes.TEXT, allowNull: false }
}, {
  timestamps: false
});


const destination = {
  name: 'Paris, France',
  description: 'The City of Light – famed for its art, cuisine, and iconic landmarks.',
  imageUrl: 'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1350&q=80'
};



app.get('/', async (req, res) => {
  try {
    const memories = await Memory.findAll();
    res.render('home', { destination, memories });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving memories');
  }
});


app.get('/memories/add', (req, res) => {
  res.render('add');
});


app.post('/memories/add', async (req, res) => {
  try {
    const { name, address, category, comments, image } = req.body;
    await Memory.create({ name, address, category, comments, image });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving memory');
  }
});


app.get('/memories/delete/:id', async (req, res) => {
  try {
    await Memory.destroy({ where: { id: req.params.id } });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting memory');
  }
});


sequelize.authenticate()
  .then(() => sequelize.sync())
  .then(() => {
    console.log(`Server started on http://localhost:${HTTP_PORT}`);
    app.listen(HTTP_PORT);
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
  });
