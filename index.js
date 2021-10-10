const express = require('express');
const path = require('path');
const PORT = 8080;

const app = express();
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'html');

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(PORT, () => {
    console.log('Server is listening on port', PORT);
});