import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Enable body parser for JSON payloads (useful for Base64 image uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Ensure required directories exist on startup
async function ensureDirectoriesExist() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error("Error creating required directories:", err);
  }
}
ensureDirectoriesExist();

// Serve static uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve static files from the built dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Read helper
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database:", err);
    return { packages: [], gallery: [] };
  }
}

// Write helper
async function writeDB(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Error writing database:", err);
    return false;
  }
}

// Secure hashed credentials
const CREDENTIALS = {
  'Libin': 'd18ab703e9564051ba5f4859c954658381fdbe729f7615ab14f8003cb80253d4', // Libin123@
  'suhaib': 'ce6b9dcc724136bffd6364eb9b7416ad9965801fe0473e18d3541495be69e863' // Assalamu123!@#
};

// Map of active session tokens (token -> expiration timestamp)
const activeSessions = new Map();

// Helper to safely compare hashes using timingSafeEqual to prevent timing attacks
function secureCompare(a, b) {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// Secure login verification API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials.' });
  }

  const storedHash = CREDENTIALS[username];
  if (!storedHash) {
    // Perform a dummy check to keep execution time similar (prevents timing analysis of username validity)
    const dummyHash = crypto.createHash('sha256').update(password).digest('hex');
    secureCompare(dummyHash, dummyHash);
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  // Hash input password
  const inputHash = crypto.createHash('sha256').update(password).digest('hex');

  // Verify credentials using secure constant-time comparison
  if (secureCompare(inputHash, storedHash)) {
    // Generate a cryptographically secure random session token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store session with 2-hour expiration time
    activeSessions.set(token, Date.now() + 2 * 60 * 60 * 1000); 

    return res.json({ success: true, token });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }
});

// Middleware for auth verification
function checkAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ success: false, message: 'Access Denied: Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const expiry = activeSessions.get(token);

  if (expiry && expiry > Date.now()) {
    // Extend session expiration on activity (slide window)
    activeSessions.set(token, Date.now() + 2 * 60 * 60 * 1000);
    next();
  } else {
    if (expiry) {
      activeSessions.delete(token); // cleanup expired session
    }
    res.status(403).json({ success: false, message: 'Access Denied: Session expired or invalid' });
  }
}

// GET About Us content
app.get('/api/aboutus', async (req, res) => {
  const db = await readDB();
  res.json(db.aboutUs || null);
});

// POST About Us content
app.post('/api/aboutus', checkAuth, async (req, res) => {
  const db = await readDB();
  db.aboutUs = req.body;
  const saved = await writeDB(db);
  if (saved) {
    res.json({ success: true, message: 'About Us content saved successfully.' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to update About Us content.' });
  }
});

// GET pricing courses/packages listAPIs
app.get('/api/courses', async (req, res) => {
  const db = await readDB();
  res.json(db.packages || []);
});

app.post('/api/courses', checkAuth, async (req, res) => {
  const newPackages = req.body;
  if (!Array.isArray(newPackages)) {
    return res.status(400).json({ success: false, message: 'Invalid packages data format.' });
  }
  const db = await readDB();
  db.packages = newPackages;
  const success = await writeDB(db);
  if (success) {
    res.json({ success: true, message: 'Courses updated successfully.' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write database.' });
  }
});

// Gallery APIs
app.get('/api/gallery', async (req, res) => {
  const db = await readDB();
  res.json(db.gallery || []);
});

app.post('/api/gallery', checkAuth, async (req, res) => {
  const newGallery = req.body;
  if (!Array.isArray(newGallery)) {
    return res.status(400).json({ success: false, message: 'Invalid gallery data format.' });
  }
  const db = await readDB();
  db.gallery = newGallery;
  const success = await writeDB(db);
  if (success) {
    res.json({ success: true, message: 'Gallery updated successfully.' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write database.' });
  }
});

// Image Upload API (receives base64 and saves to uploads/ directory)
app.post('/api/gallery/upload', checkAuth, async (req, res) => {
  const { fileName, base64Data } = req.body;
  if (!fileName || !base64Data) {
    return res.status(400).json({ success: false, message: 'Missing file data' });
  }

  try {
    // base64Data looks like: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid base64 payload' });
    }

    const dataBuffer = Buffer.from(matches[2], 'base64');
    
    // Clean and generate unique file name to avoid collisions
    const cleanFileName = Date.now() + '-' + fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const uploadPath = path.join(__dirname, 'uploads', cleanFileName);
    
    await fs.writeFile(uploadPath, dataBuffer);
    
    // The image path will be /uploads/cleanFileName, which is served by app.use('/uploads', ...)
    res.json({ success: true, url: `/uploads/${cleanFileName}` });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: 'Failed to save uploaded image' });
  }
});

// Reels APIs
app.get('/api/reels', async (req, res) => {
  const db = await readDB();
  res.json(db.reels || []);
});

app.post('/api/reels', checkAuth, async (req, res) => {
  const newReels = req.body;
  if (!Array.isArray(newReels)) {
    return res.status(400).json({ success: false, message: 'Invalid reels data format.' });
  }
  const db = await readDB();
  db.reels = newReels;
  const success = await writeDB(db);
  if (success) {
    res.json({ success: true, message: 'Reels updated successfully.' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write database.' });
  }
});

// Scraper function for Instagram Reel covers
async function getInstagramReelCover(reelUrl) {
  try {
    const match = reelUrl.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/);
    if (!match) return null;
    const shortcode = match[1];
    const targetUrl = `https://www.instagram.com/reel/${shortcode}/`;
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    
    if (!response.ok) return null;
    const html = await response.text();
    
    // Match og:image tag
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
                          
    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1].replace(/&amp;/g, '&');
    }
    
    // Fallback: match other script tags containing display_url
    const displayUrlMatch = html.match(/"display_url":"([^"]+)"/);
    if (displayUrlMatch && displayUrlMatch[1]) {
      return displayUrlMatch[1].replace(/\\u0026/g, '&');
    }
  } catch (err) {
    console.error("Scraping Instagram cover error:", err);
  }
  return null;
}

app.post('/api/reels/fetch-cover', checkAuth, async (req, res) => {
  const { reelUrl } = req.body;
  if (!reelUrl) {
    return res.status(400).json({ success: false, message: 'Missing Reel URL' });
  }

  // Check if it is a profile link instead of a specific post link
  if (!reelUrl.includes('/reel/') && !reelUrl.includes('/p/')) {
    return res.status(400).json({ 
      success: false, 
      message: 'This is an Instagram Profile link. Please paste the direct URL of a specific Reel post (e.g., instagram.com/reel/...).' 
    });
  }

  const coverUrl = await getInstagramReelCover(reelUrl);
  if (coverUrl) {
    try {
      const imgRes = await fetch(coverUrl);
      if (imgRes.ok) {
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const cleanFileName = `instagram-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
        const uploadPath = path.join(__dirname, 'uploads', cleanFileName);
        await fs.writeFile(uploadPath, buffer);
        return res.json({ success: true, imageUrl: `/uploads/${cleanFileName}` });
      }
    } catch (downloadErr) {
      console.error("Error downloading Instagram cover photo:", downloadErr);
    }
    return res.json({ success: true, imageUrl: coverUrl });
  } else {
    return res.status(400).json({ 
      success: false, 
      message: 'Instagram blocked the automated fetch request. Please upload the cover photo manually using the uploader.' 
    });
  }
});

// Hero Banner APIs
app.get('/api/hero', async (req, res) => {
  const db = await readDB();
  res.json(db.heroSlides || []);
});

app.post('/api/hero', checkAuth, async (req, res) => {
  const newSlides = req.body;
  if (!Array.isArray(newSlides)) {
    return res.status(400).json({ success: false, message: 'Invalid hero slides data format.' });
  }
  const db = await readDB();
  db.heroSlides = newSlides;
  const success = await writeDB(db);
  if (success) {
    res.json({ success: true, message: 'Hero banner slides updated successfully.' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write database.' });
  }
});

// Reviews (Testimonials) APIs
app.get('/api/reviews', async (req, res) => {
  const db = await readDB();
  res.json(db.reviews || []);
});

app.post('/api/reviews', checkAuth, async (req, res) => {
  const newReviews = req.body;
  if (!Array.isArray(newReviews)) {
    return res.status(400).json({ success: false, message: 'Invalid reviews data format.' });
  }
  const db = await readDB();
  db.reviews = newReviews;
  const success = await writeDB(db);
  if (success) {
    res.json({ success: true, message: 'Reviews updated successfully.' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write database.' });
  }
});

// Job Openings (Careers) APIs
app.get('/api/jobs', async (req, res) => {
  const db = await readDB();
  res.json(db.jobs || []);
});

app.post('/api/jobs', checkAuth, async (req, res) => {
  const newJobs = req.body;
  if (!Array.isArray(newJobs)) {
    return res.status(400).json({ success: false, message: 'Invalid jobs data format.' });
  }
  const db = await readDB();
  db.jobs = newJobs;
  const success = await writeDB(db);
  if (success) {
    res.json({ success: true, message: 'Job openings updated successfully.' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write database.' });
  }
});

// Blog APIs
app.get('/api/blogs', async (req, res) => {
  const db = await readDB();
  res.json(db.blogs || []);
});

app.post('/api/blogs', checkAuth, async (req, res) => {
  const newBlogs = req.body;
  if (!Array.isArray(newBlogs)) {
    return res.status(400).json({ success: false, message: 'Invalid blogs data format.' });
  }
  const db = await readDB();
  db.blogs = newBlogs;
  const success = await writeDB(db);
  if (success) {
    res.json({ success: true, message: 'Blog posts updated successfully.' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write database.' });
  }
});

// Dynamic Sitemap XML Endpoint
app.get('/sitemap.xml', async (req, res) => {
  try {
    const db = await readDB();
    const blogs = db.blogs || [];
    const nowStr = new Date().toISOString().split('T')[0];
    const publishedBlogs = blogs.filter(b => b.isPublished || (b.status === 'published') || (b.status === 'scheduled' && b.scheduledPublishDate <= nowStr));
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url>\n    <loc>${req.protocol}://${req.get('host')}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${req.protocol}://${req.get('host')}/blog</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    
    publishedBlogs.forEach(post => {
      xml += `  <url>\n    <loc>${req.protocol}://${req.get('host')}/blog/${post.slug}</loc>\n    <lastmod>${post.createdAt}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });
    
    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

// Dynamic RSS Feed XML Endpoint
app.get('/blog/feed.xml', async (req, res) => {
  try {
    const db = await readDB();
    const blogs = db.blogs || [];
    const nowStr = new Date().toISOString().split('T')[0];
    const publishedBlogs = blogs.filter(b => b.isPublished || (b.status === 'published') || (b.status === 'scheduled' && b.scheduledPublishDate <= nowStr));

    let xml = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0">\n<channel>\n`;
    xml += `  <title>UpDrive Driving School Blog</title>\n`;
    xml += `  <link>${req.protocol}://${req.get('host')}/blog</link>\n`;
    xml += `  <description>Empathetic, judgment-free training and professional driving lessons insights.</description>\n`;
    
    publishedBlogs.forEach(post => {
      xml += `  <item>\n`;
      xml += `    <title>${post.title}</title>\n`;
      xml += `    <link>${req.protocol}://${req.get('host')}/blog/${post.slug}</link>\n`;
      xml += `    <description>${post.metaDescription}</description>\n`;
      xml += `    <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>\n`;
      xml += `    <guid>${req.protocol}://${req.get('host')}/blog/${post.slug}</guid>\n`;
      xml += `  </item>\n`;
    });
    
    xml += `</channel>\n</rss>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating RSS feed');
  }
});

// Serve the index.html for all other routes (Single Page App routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
