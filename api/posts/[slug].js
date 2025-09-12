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
    
    // For testing purposes, return a hardcoded string
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Hello from API for slug: ${slug}`);
};