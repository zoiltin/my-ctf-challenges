const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { visit } = require('./bot');

const app = express();
const port = 3000;

const csp = "script-src 'self'; object-src 'none'; base-uri 'none';";

const reportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: 'Too many login attempts, please try again later.',
}); // 每分钟1次

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', csp);
  next();
});
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.get('/report', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'report.html'));
});

app.post('/report', reportLimiter, (req, res) => {
  const text = req.body.text;

  if (text) {
    try{
      visit(text);
      res.status(200).json({'msg' : 'success'});
    }
    catch{
      res.status(500).json({'msg' : "service error"});
    }
    
  } else {
    res.status(400).json({'msg' : 'invalid text'});
  }
});

app.use((req, res) => {
  res.status(200).type('text/plain').send(`${decodeURI(req.path)} : invalid path`);
}); // 404 页面

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});