const pollMessage = require("./messages/poll.json");
const axios = require("axios");

polls = {};

class Poll {
    constructor(channel) {
        this.channel = channel;
        this.usersByVote = {};
        this.votesByUser = { a: [], b: [], c: [] };
        this.message = JSON.parse(JSON.stringify(pollMessage)); // ugly method for deep copy of base message
    }

    tallyVote(responseUrl, user, vote) {
        // TODO: return "you already voted" message if user already voted
        this.usersByVote[user] = vote.value; // each user can have one vote
        this.votesByUser[vote.value].push(user); // each vote will have multiple users

        const countA = this.votesByUser["a"].length;
        const countB = this.votesByUser["b"].length;
        const countC = this.votesByUser["c"].length;

        // TODO: update regex to handle decimals
        // TODO: update regex to display percentage and count
        this.message.blocks[2].text.text = this.message.blocks[2].text.text.replace(/\d+(?=%)/, Math.round(100 * countA / (countA + countB + countC)));
        this.message.blocks[3].text.text = this.message.blocks[3].text.text.replace(/\d+(?=%)/, Math.round(100 * countB / (countA + countB + countC)));
        this.message.blocks[4].text.text = this.message.blocks[4].text.text.replace(/\d+(?=%)/, Math.round(100 * countC / (countA + countB + countC)));

        // update percentages in original message
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

function createPoll(channel) {
    if (polls[channel]) return { message: { text: "Poll already exists in this channel! End the current poll to start a new one." } };
    const poll = new Poll(channel);
    polls[channel] = poll;
    return poll;
}

function tallyVote(responseUrl, channel, user, vote) {
    const poll = polls[channel];
    if (poll) {
        poll.tallyVote(responseUrl, user, vote);
    }
}

module.exports = {
    createPoll: createPoll,
    tallyVote: tallyVote
};