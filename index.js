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
const urlHost = process.env.URLHOST || null; // Will auto-detect if not set
const node_Mode = process.env.NODE_ENV || 'development';
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shrtnr';

const db = monk(mongoURI);

// Add MongoDB connection error handling
db.then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  console.error('Please make sure MongoDB is running on', mongoURI);
  process.exit(1);
});

const urls = db.get('urls');
urls.createIndex({ slug: 1 }, { unique: true });

const app = express();
// Enable trust proxy for reverse proxy support
// Set to 1 to trust first proxy (typical for single reverse proxy setup)
// For production, set this to the specific number of proxies or IP addresses
app.set('trust proxy', 1);

app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('common'));

app.use(express.json());

const notFoundPath = path.join(__dirname, 'public/404.html');

// Helper function to get the hostname from request
function getHostname(req) {
  if (urlHost) {
    return urlHost;
  }

  // Try to get from various headers (reverse proxy)
  const forwarded = req.headers['x-forwarded-host'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Get from Host header
  return req.headers.host || req.hostname || 'localhost';
}

// API Documentation JSON endpoint - must be before static files
app.get('/api/docs', (req, res) => {
  const detectedHost = getHostname(req);
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const baseUrl = `${protocol}://${detectedHost}`;

  // Generate dynamic example URLs
  const exampleUrl = 'https://github.com/casjay/csj.lol';
  const exampleSlug = 'github';

  res.json({
    name: 'URL Shortener API',
    version: '1.1.0',
    baseUrl,
    endpoints: {
      createUrl: {
        method: 'POST',
        path: '/url',
        description: 'Create a shortened URL',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          url: 'string (required) - The URL to shorten',
          slug: 'string (optional) - Custom slug for the short URL'
        },
        response: {
          success: {
            _id: 'string - Database ID',
            url: 'string - Original URL',
            slug: 'string - URL slug',
            clicks: 'number - Click count',
            createdAt: 'string - Creation timestamp',
            shortUrl: 'string - Full short URL'
          },
          error: {
            message: 'string - Error message'
          }
        },
        rateLimit: '3 requests per 10 seconds'
      },
      listUrls: {
        method: 'GET',
        path: '/api/urls',
        description: 'Get paginated list of all URLs',
        queryParams: {
          page: 'number (optional, default: 1) - Page number',
          limit: 'number (optional, default: 50) - Items per page',
          sort: 'string (optional, default: newest) - Sort order (newest|oldest)'
        },
        response: {
          urls: 'array - List of URL objects',
          pagination: {
            page: 'number - Current page',
            limit: 'number - Items per page',
            totalPages: 'number - Total pages',
            totalUrls: 'number - Total URLs',
            hasNext: 'boolean - Has next page',
            hasPrev: 'boolean - Has previous page'
          }
        }
      },
      redirectUrl: {
        method: 'GET',
        path: '/:slug',
        description: 'Redirect to original URL and increment click counter',
        response: '302 redirect to original URL'
      }
    },
    examples: {
      curl: {
        createUrl: `curl -X POST ${baseUrl}/url -H "Content-Type: application/json" -d '{"url":"${exampleUrl}","slug":"${exampleSlug}"}'`,
        listUrls: `curl ${baseUrl}/api/urls?page=1&limit=10&sort=newest`
      },
      javascript: {
        createUrl: `fetch('${baseUrl}/url', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({url: '${exampleUrl}', slug: '${exampleSlug}'})
})`,
        listUrls: `fetch('${baseUrl}/api/urls?page=1&limit=10')`
      }
    }
  });
});

app.get('/api/urls', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const sort = req.query.sort || 'newest';
    const skip = (page - 1) * limit;

    const sortOrder = sort === 'oldest' ? 1 : -1;

    // Use countDocuments for newer MongoDB versions, fallback to count
    const totalUrls = await (urls.countDocuments ? urls.countDocuments({}) : urls.count({}));
    const totalPages = Math.ceil(totalUrls / limit);

    const urlList = await urls.find({}, {
      limit,
      skip,
      sort: { _id: sortOrder }
    });

    res.json({
      urls: urlList || [],
      pagination: {
        page,
        limit,
        totalPages,
        totalUrls,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch URLs',
      urls: [],
      pagination: {
        page: 1,
        limit: 50,
        totalPages: 0,
        totalUrls: 0,
        hasNext: false,
        hasPrev: false
      }
    });
  }
});

// Serve static files after API routes
app.use(express.static('./public'));

app.get('/:id', async (req, res, next) => {
  const { id: slug } = req.params;
  try {
    const url = await urls.findOne({
      slug,
    });
    if (url) {
      // Increment click count
      await urls.update(
        { slug },
        { $inc: { clicks: 1 } }
      );
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
    delayMs: () => 500,
  }),
  rateLimit({
    windowMs: 10 * 1000,
    max: 3,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Remove custom keyGenerator to use default which respects trust proxy setting
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests, please try again later.'
      });
    },
  }),
  async (req, res, next) => {
    const getAgent = req.headers['user-agent'];
    if (getAgent.includes('curl')) {
      setAgent = 'consoleClient';
    } else if (getAgent.includes('wget')) {
      setAgent = 'consoleClient';
    } else if (getAgent.includes('httpie')) {
      setAgent = 'consoleClient';
    } else
      setAgent = ''
    let { slug, url } = req.body;
    try {
      await schema.validate({
        slug,
        url,
      });
      const detectedHost = getHostname(req);
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';

      if (url.includes(detectedHost)) {
        throw new Error(`Error: Adding ${detectedHost} is not supported. 🛑`);
      }
      if (!slug) {
        slug = nanoid(5);
      } else {
        const existing = await urls.findOne({
          slug,
        });
        if (existing) {
          throw new Error(`Slug ${protocol}://${detectedHost}/${slug} is in use. 🍔`);
        }
      }
      slug = slug.toLowerCase();
      const newUrl = {
        url,
        slug,
        clicks: 0,
        createdAt: new Date(),
      };
      const created = await urls.insert(newUrl);
      const shortUrl = `${protocol}://${detectedHost}/${slug}`;

      if (!setAgent) {
        res.status(200).json({
          ...created,
          shortUrl
        });
      } else {
        res.status(200).send(shortUrl + '\n');
      }
    } catch (error) {
      next(error);
    }
  }
);

app.use((req, res, next) => {
  const getAgent = req.headers['user-agent'];
  if (getAgent.includes('curl')) {
    setAgent = 'consoleClient';
  } else if (getAgent.includes('wget')) {
    setAgent = 'consoleClient';
  } else if (getAgent.includes('httpie')) {
    setAgent = 'consoleClient';
  }
  if (setAgent) {
    res.status(404).send('File not found 😠');
  } else {
    res.status(404).sendFile(notFoundPath);
  }
});

app.use((error, req, res, next) => {
  const getAgent = req.headers['user-agent'];
  if (getAgent.includes('curl')) {
    setAgent = 'consoleClient';
  } else if (getAgent.includes('wget')) {
    setAgent = 'consoleClient';
  } else if (getAgent.includes('httpie')) {
    setAgent = 'consoleClient';
  }
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  if (setAgent) {
    const message = error.message;
    res.send(message + '\n');
  } else {
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port} in ${node_Mode} mode`);
  console.log(`MongoDB URI: ${mongoURI}`);
});
