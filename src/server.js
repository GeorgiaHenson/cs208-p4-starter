import express from 'express'
import sql from 'sqlite3'

const sqlite3 = sql.verbose()

// Create an in memory table to use
const db = new sqlite3.Database(':memory:')

// This is just for testing you would not want to create the table every
// time you start up the app feel free to improve this code :)
db.run(`CREATE TABLE todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL)`)

const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    const local = { tasks: [] }
    db.each('SELECT id, task FROM todo', function (err, row) {
      if (err) {
        console.log(err)
      } else {
        local.tasks.push({ id: row.id, task: row.task })
      }
    }, function (err, numrows) {
      if (!err) {
        res.render('index', local)
      } else {
        console.log(err)
      }
    })
});

app.post('/add', (req, res) => {
    const task = req.body.task;
    db.run('INSERT INTO todo (task) VALUES (?)', [task], err => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.redirect('/');
    });
});

app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM todo WHERE id = ?', [id], err => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.redirect('/');
    });
});

// Start the web server
app.listen(3000, function () {
    console.log('Listening on port 3000...')
})
