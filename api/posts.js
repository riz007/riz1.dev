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

    const postsDir = path.join(__dirname, '..', 'posts');

    try {
        const files = await fs.readdir(postsDir);
        const markdownFiles = files.filter(file => file.endsWith('.md'));
        const posts = await Promise.all(
            markdownFiles.map(async (file) => {
                const filePath = path.join(postsDir, file);
                const content = await fs.readFile(filePath, 'utf8');
                let title = file.replace(/\.md$/, '').replace(/-/g, ' ');
                let date = 'No date';
                const titleMatch = content.match(/^#\s+(.*)/m);
                if (titleMatch && titleMatch[1]) { title = titleMatch[1]; }
                const dateMatch = content.match(/\*Published on (.*?)\*/);
                if (dateMatch && dateMatch[1]) { date = dateMatch[1]; }
                return { date, title, file };
            })
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(posts));
    } catch (dirError) {
        console.error('Failed to read posts directory:', dirError);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to read posts directory');
    }
};