const { checkPolls } = require("../../poll.js");
const pollService = require("../../poll.js");

// TODO: set up select correct answer flow, save results to database once the correct answer is specified

// TODO: how to reset?

// TODO: add leaderboard slash command?

// initiated by slash command /createpoll
function createPoll(req, res) {
    const result = checkPolls(req.body.channel_name);
    res.status(200).json(result);
}

// intiated by button clicks in interactive messages
function action(req, res) {
    res.status(200).send();

    const payload = JSON.parse(req.body.payload);
    const action = payload.actions[0];

    if (action.block_id == "vote") {
        pollService.tallyVote(payload.response_url, payload.channel.name, payload.user.username, payload.actions[0]);
    }
    else if (action.block_id == "options" && action.action_id == "submit") {
        const truth1 = payload.state.values.block1.action1.value;
        const truth2 = payload.state.values.block2.action2.value;
        const lie = payload.state.values.block3.action3.value;

        pollService.createPoll(payload.response_url, payload.channel.name, truth1, truth2, lie);
    }
    else if (action.block_id == "options" && action.action_id == "close") {
        // TODO: handle close option in options message
    }
}

module.exports = {
    createPoll: createPoll,
    action: action
};