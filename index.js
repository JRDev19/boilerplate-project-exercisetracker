const express = require('express')
const app = express()
const cors = require('cors')
const { uid } = require('uid')
require('dotenv').config()

const users = [];
const logs = [];

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.urlencoded({ extended: false }));

app.post('/api/users', (req, res) => {
  let user = { username: req.body.username, _id: uid(24) }

  users.push(user);

  res.json(user);
});

app.get('/api/users', (req, res) => {
  res.json(users)
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const id = req.params._id;
  let { description, duration, date } = req.body;
  const username = users.filter(u => u["_id"] == id)[0].username;
  date = date ? new Date(date).toDateString() : new Date().toDateString();
  duration = Number(duration);

  logs.push({ username, description, duration, date, _id: id });

  res.json({ username, description, duration, date, _id: id });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === id);

  let userLogs = logs.filter(log => log._id === id);

  const fromDate = from ? new Date(from).getTime() : null;
  const toDate = to ? new Date(to).getTime() : null;

  userLogs = userLogs.filter(log => {
    const logTimestamp = new Date(log.date).getTime();
    if (fromDate && logTimestamp < fromDate) return false;
    if (toDate && logTimestamp > toDate) return false;
    return true;
  });

  if (limit) {
    userLogs = userLogs.slice(0, Number(limit));
  }

  res.json({
    username: user.username,
    count: userLogs.length,
    _id: id,
    log: userLogs.map(log => ({
      description: log.description,
      duration: log.duration,
      date: log.date
    }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
