const pollService = require("../../poll.js");

// TODO: create setup flow and select correct answer flow, save results to database once the correct answer is specified

// TODO: how to reset?

function createPoll(req, res) {
    const result = pollService.createPoll(req.body.channel_name); // use channel name as unique identifier for poll (so only one active poll per channel allowed)
    res.status(200).json(result.message);
}

function vote(req, res) {
    res.status(200).send();
    const payload = JSON.parse(req.body.payload);
    pollService.tallyVote(payload.response_url, payload.channel.name, payload.user.username, payload.actions[0]);
}

module.exports = {
    createPoll: createPoll,
    vote: vote
};