const express = require("express");
const verification = require("./api/middleware/verification");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use("/", verification.slackSignature);

const routes = require("./api/routes/test");
routes(app);

app.use(function (req, res) {
    res.status(404).send({ url: `${req.originalUrl} not found` });
});

const port = process.env.PORT || 9000;
app.listen(port);