const slack = require("../controllers/slack");

module.exports = function (app) {
    app.route("/createPoll").post(slack.createPoll);
    app.route("/selectOption").post(slack.selectOption);
};