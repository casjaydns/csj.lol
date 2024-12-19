const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const monk = require('monk');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const cors = require('cors');
const { nanoid } = require('nanoid');

require('dotenv').config({
  path: './.env',
});

const port = process.env.PORT || '2550';
const urlHost = process.env.URLHOST || 'localhost';
const node_Mode = process.env.NODE_ENV || 'development';
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shrtnr';

const db = monk(mongoURI);
const urls = db.get('urls');
urls.createIndex(
  {
    slug: 1,
  },
  {
    unique: true,
  }
);

const app = express();
app.enable('trust proxy');

app.use(cors());
app.use(helmet());
app.use(morgan('common'));

app.use(express.json());
app.use(express.static('./public'));

const notFoundPath = path.join(__dirname, 'public/404.html');
app.get('/:id', async (req, res, next) => {
  const { id: slug } = req.params;
  try {
    const url = await urls.findOne({
      slug,
    });
    if (url) {
      return res.redirect(url.url);
    }
    return res.status(404).sendFile(notFoundPath);
  } catch (error) {
    return res.status(404).sendFile(notFoundPath);
  }
});

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/^[\w\-]+$/i),
  url: yup.string().trim().url().required(),
});

app.post(
  '/url',
  slowDown({
    windowMs: 10 * 1000,
    delayAfter: 1,
    delayMs: 500,
  }),
  rateLimit({
    windowMs: 10 * 100,
    max: 3,
  }),
  async (req, res, next) => {
    const getAgent = req.headers['user-agent'];
    if (getAgent.includes('curl')) {
      setAgent = 'consoleClient';
    } else if (getAgent.includes('wget')) {
      setAgent = 'consoleClient';
    } else if (getAgent.includes('httpie')) {
      setAgent = 'consoleClient';
    }
    console.log(setAgent);
    let { slug, url } = req.body;
    try {
      await schema.validate({
        slug,
        url,
      });
      if (url.includes(urlHost)) {
        throw new Error(`Error: Adding ${urlHost} is not supported. 🛑`);
      }
      if (!slug) {
        slug = nanoid(5);
      } else {
        const existing = await urls.findOne({
          slug,
        });
        if (existing) {
          throw new Error(`${existing} in use. 🍔`);
        }
      }
      slug = slug.toLowerCase();
      const newUrl = {
        url,
        slug,
      };
      const created = await urls.insert(newUrl);
      if (setAgent) {
        res.status(200).send(`https://${urlHost}/${slug}\n`);
      } else {
        res.status(200).json(created);
      }
    } catch (error) {
      next(error);
    }
  }
);
console.log(error.message);
app.use((req, res, next) => {
  res.status(404).sendFile(notFoundPath);
});

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
  });
});

app.listen(port, () => {
  console.log(`Connected to ${mongoURI}`);
  console.log(`Listening on ${port} in ${node_Mode} mode`);
});
