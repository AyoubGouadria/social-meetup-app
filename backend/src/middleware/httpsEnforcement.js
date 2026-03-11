/**
 * HTTPS Redirect Middleware
 * Forces HTTPS connections in production environment
 * 
 * Security: Prevents man-in-the-middle attacks and ensures encrypted communication
 */

const httpsRedirect = (req, res, next) => {
  // Only enforce in production
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Check if request is already HTTPS
  // x-forwarded-proto is set by most cloud providers (Heroku, AWS, Railway, etc.)
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;

  if (protocol !== 'https') {
    // Redirect to HTTPS
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }

  next();
};

/**
 * HSTS (HTTP Strict Transport Security) Header
 * Tells browsers to only use HTTPS for this domain
 */
const hstsMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // max-age=31536000 = 1 year
    // includeSubDomains = apply to all subdomains
    // preload = submit to browser preload lists
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
};

module.exports = {
  httpsRedirect,
  hstsMiddleware
};
