// next-sitemap.config.js
module.exports = {
    siteUrl: process.env.SITE_URL || 'http://localhost:3000', // Your site URL
    generateRobotsTxt: true, // Generate robots.txt file
    sitemapSize: 7000, // Limit for sitemap size (default is 5000)
  };
  