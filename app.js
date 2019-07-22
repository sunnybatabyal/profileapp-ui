const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => res.sendFile('dashboard.html', { root: 'public' }))

// Employees routes.
app.get('/employees', (req, res) => res.sendFile('employee.html', { root: 'public' }))

// Company routes.
app.get('/companies', (req, res) => res.sendFile('company.html', { root: 'public' }))

// Designation routes.
app.get('/designations', (req, res) => res.sendFile('designation.html', { root: 'public' }))

// Country routes.
app.get('/countries', (req, res) => res.sendFile('country.html', { root: 'public' }))

// State routes.
app.get('/states', (req, res) => res.sendFile('state.html', { root: 'public' }))

// City routes.
app.get('/cities', (req, res) => res.sendFile('city.html', { root: 'public' }))

// Asset routes.
app.get('/asset-types', (req, res) => res.sendFile('asset-type.html', { root: 'public' }))

app.listen(port, () => console.log(`profileapp listening on port ${port}!`))

// Node modules.
app.use('/node_modules', express.static(__dirname + '/node_modules'))

// Local assets.
app.use('/assets', express.static(__dirname + '/public/assets'))
