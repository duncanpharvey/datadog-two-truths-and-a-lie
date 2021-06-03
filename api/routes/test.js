const testController = require("../controllers/test");

module.exports = function (app) {
    app.route("/test").post(testController.test);
};