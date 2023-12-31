const express = require('express');
const axios = require('axios');
// const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// app.use(
//     session({
//         secret: 'your-secret-key', // Change this to your secret key
//         resave: false,
//         saveUninitialized: true,
//     })
// );

const auth0Domain = 'dev-x9vcburz.us.auth0.com';
const auth0ClientId = 'Y5sCgikFYCrw8zybI08PXcwSZx1QHDJ8';
const auth0ClientSecret = 'A4xnZDzfwueLvnw8xMCfBpoOx2HwVj_1ItxG_EawrQcFm6N-H2DXxXTPerFu8ylH';

app.get('/', (req, res) => {
    let token = req.header('Authorization');

    if (token) {
        token = token.replace("Bearer ", "");

        axios
            .get(`https://${auth0Domain}/userinfo`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((userInfo) => {
                res.json({
                    username: userInfo.data.name,
                    logout: 'http://localhost:3000/logout',
                });
            })
            .catch((error) => {
                console.error(error);
                res.status(401).send('Authentication failed');
            });

    } else {
        res.sendFile(path.join(__dirname + '/index.html'));
    }
    if (req.session && req.session.username) {
        return res.json({
            username: req.session.username,
            logout: 'http://localhost:3000/logout',
        });
    }
});

app.post('/api/login', (req, res) => {
    const {login, password} = req.body;
    let accessToken;

    // Authenticate the user with Auth0 using the Password Grant Type
    axios
        .post(`https://${auth0Domain}/oauth/token`, {
            grant_type: 'password',
            username: login,
            password: password,
            scope: 'openid profile email',
            client_id: auth0ClientId,
            client_secret: auth0ClientSecret,
        })
        .then((auth0Response) => {
            accessToken = auth0Response.data.access_token;
            res.json({token: accessToken});
        })
        .catch((error) => {
            console.error(error);
            res.status(401).send('Authentication failed');
        });
});


app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
