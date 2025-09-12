const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const { slug } = req.query;
    console.log('Serverless function invoked for slug:', slug);

    const postsDir = path.join(__dirname, '..', 'posts');
    console.log('Calculated postsDir:', postsDir);

    if (!slug || slug.includes('..') || slug.includes('/')) {
        console.error('Invalid slug provided:', slug);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid file name');
        return;
    }

    const filePath = path.join(postsDir, `${slug}.md`);
    console.log('Attempting to read file from filePath:', filePath);

    try {
        const data = await fs.readFile(filePath, 'utf8');
        console.log('Successfully read file:', filePath);
        res.writeHead(200, { 'Content-Type': 'text/markdown' });
        res.end(data);
    } catch (err) {
        console.error('Failed to read post file:', filePath, 'Error:', err);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`Post not found or inaccessible: ${slug}. Error: ${err.message}`);
    }
};