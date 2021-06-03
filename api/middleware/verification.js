const crypto = require("crypto");
const qs = require("qs");

function slackSignature(req, res, next) {
    let slackSignature = req.headers["x-slack-signature"];
    let requestBody = qs.stringify(req.body, { format: "RFC1738" });
    let timestamp = req.headers["x-slack-request-timestamp"];

    let time = Math.floor(new Date().getTime() / 1000);
    if (Math.abs(time - timestamp) > 300) {
        return res.status(400).send({ message: "Ignoring old request" });
    }

    let sigBasestring = "v0:" + timestamp + ":" + requestBody;

    let mySignature =
        "v0=" +
        crypto
            .createHmac("sha256", process.env.SLACK_SIGNING_SECRET)
            .update(sigBasestring, "utf8")
            .digest("hex");

    if (
        slackSignature &&
        crypto.timingSafeEqual(
            Buffer.from(mySignature, "utf8"),
            Buffer.from(slackSignature, "utf8")
        )
    ) {
        next();
    } else {
        return res.status(400).send({ message: "Verification failed" });
    }
}

module.exports = {
    slackSignature: slackSignature,
};