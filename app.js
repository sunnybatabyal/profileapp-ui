const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => res.sendFile('dashboard.html', { root: 'public' }))

// Employees routes.
app.get('/employees', (req, res) => res.sendFile('view.html', { root: 'public/modules/employee' }))
app.get('/employees/add', (req, res) => res.sendFile('add.html', { root: 'public/modules/employee' }))

// Company routes.
app.get('/companies', (req, res) => res.sendFile('view.html', { root: 'public/modules/company' }))
app.get('/companies/add', (req, res) => res.sendFile('add.html', { root: 'public/modules/company' }))

// Designation routes.
app.get('/designations', (req, res) => res.sendFile('view.html', { root: 'public/modules/designation' }))
app.get('/designations/add', (req, res) => res.sendFile('add.html', { root: 'public/modules/designation' }))

// Country routes.
app.get('/countries', (req, res) => res.sendFile('view.html', { root: 'public/modules/country' }))
app.get('/countries/add', (req, res) => res.sendFile('add.html', { root: 'public/modules/country' }))

// State routes.
app.get('/states', (req, res) => res.sendFile('view.html', { root: 'public/modules/state' }))
app.get('/states/add', (req, res) => res.sendFile('add.html', { root: 'public/modules/state' }))

// City routes.
app.get('/cities', (req, res) => res.sendFile('view.html', { root: 'public/modules/city' }))
app.get('/cities/add', (req, res) => res.sendFile('add.html', { root: 'public/modules/city' }))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// Node modules.
app.use('/node_modules', express.static(__dirname + '/node_modules'))

// Local assets.
app.use('/assets', express.static(__dirname + '/public/assets'))
