// TODO: create setup flow and select correct answer flow, save results to database once the correct answer is specified

// TODO: how to reset? how to have multiple instances at once?

const poll = require("../../messages/poll.json");
const axios = require("axios");

const usersByVote = {};
const votesByUser = {a: [], b: [], c: []};

function createPoll(req, res) {
    res.status(200).json(poll);
}

async function selectOption(req, res) {
    res.status(200).send();
    await updatePoll(JSON.parse(req.body.payload));

}

async function updatePoll(payload) {
    const user = payload.user.username;
    const vote = payload.actions[0].value;

    // TODO: return "you already voted" message if user already voted
    usersByVote[user] = vote; // each user can have one vote
    votesByUser[vote].push(user); // each vote will have multiple users
    
    var temp = poll;
    countA = votesByUser["a"].length;
    countB = votesByUser["b"].length;
    countC = votesByUser["c"].length;

    // TODO: update regex to handle decimals
    // TODO: update regex to display percentage and count
    temp.blocks[2].text.text = temp.blocks[2].text.text.replace(/\d+(?=%)/, Math.round(100 * countA / (countA + countB + countC)));
    temp.blocks[3].text.text = temp.blocks[3].text.text.replace(/\d+(?=%)/, Math.round(100 * countB / (countA + countB + countC)));
    temp.blocks[4].text.text = temp.blocks[4].text.text.replace(/\d+(?=%)/, Math.round(100 * countC / (countA + countB + countC)));

    // update percentages in original message
    await axios({
        method: "post",
        url: payload.response_url,
        data: temp
    })

    // display to user who you voted for
    await axios({
        method: "post",
        url: payload.response_url,
        data: {
            text: `You voted for ${payload.actions[0].text.text}`,
            response_type: "ephemeral",
            replace_original: false
        }
    })
}

module.exports = {
    createPoll: createPoll,
    selectOption: selectOption
};
