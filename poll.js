const pollMessageTemplate = require("./messages/poll.json"); // TODO: combine require for messages
const optionsMessage = require("./messages/options.json");
const axios = require("axios");

polls = {};

class Poll {
    constructor(channel, message) {
        this.channel = channel;
        this.usersByVote = {};
        this.votesByUser = { a: [], b: [], c: [] };
        this.message = message;
    }

    tallyVote(responseUrl, user, vote) {
        // TODO: return "you already voted" message if user already voted
        this.usersByVote[user] = vote.action_id; // each user can have one vote
        this.votesByUser[vote.action_id].push(user); // each vote will have multiple users

        const countA = this.votesByUser["a"].length;
        const countB = this.votesByUser["b"].length;
        const countC = this.votesByUser["c"].length;

        // TODO: update regex to handle decimals
        // TODO: update regex to display percentage and count
        this.message.blocks[2].text.text = this.message.blocks[2].text.text.replace(/\d+(?=%)/, Math.round(100 * countA / (countA + countB + countC)));
        this.message.blocks[3].text.text = this.message.blocks[3].text.text.replace(/\d+(?=%)/, Math.round(100 * countB / (countA + countB + countC)));
        this.message.blocks[4].text.text = this.message.blocks[4].text.text.replace(/\d+(?=%)/, Math.round(100 * countC / (countA + countB + countC)));

        // update percentages in original message
        this.message.replace_original = true;
        axios({
            method: "post",
            url: responseUrl,
            data: this.message
        });

        // display who user voted for
        axios({
            method: "post",
            url: responseUrl,
            data: {
                text: `You voted for ${vote.text.text}`,
                response_type: "ephemeral",
                replace_original: false
            }
        });
    }
}

function checkPolls(channel) {
    if (polls[channel]) {
        return { text: "Poll already exists in this channel! End the current poll to start a new one." };
    }
    else {
        return optionsMessage;
    }
}

function createPoll(responseUrl, channel, truth1, truth2, lie) {
    var message = JSON.parse(JSON.stringify(pollMessageTemplate));

    // TODO: randomize lie
    message.blocks[1].elements[0].text.text = truth1;
    message.blocks[1].elements[1].text.text = truth2;
    message.blocks[1].elements[2].text.text = lie;

    message.blocks[2].text.text = message.blocks[2].text.text.replace(/.+(?= \|)/, truth1);
    message.blocks[3].text.text = message.blocks[2].text.text.replace(/.+(?= \|)/, truth2);
    message.blocks[4].text.text = message.blocks[2].text.text.replace(/.+(?= \|)/, lie);

    message.response_type = "in_channel";
    message.replace_original = false;

    const poll = new Poll(channel, message);
    polls[channel] = poll;

    // TODO: Update options message to show "submitted"

    axios({
        method: "post",
        url: responseUrl,
        data: poll.message
    });
}

function tallyVote(responseUrl, channel, user, vote) {
    const poll = polls[channel];
    if (poll) {
        poll.tallyVote(responseUrl, user, vote);
    }
}

module.exports = {
    checkPolls: checkPolls,
    createPoll: createPoll,
    tallyVote: tallyVote
};