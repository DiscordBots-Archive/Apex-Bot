const { Command } = require('klasa');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['yomama'],

			description: 'Yo momma is so fat, yo.'
		});
	}

	async run(msg) {
		const { text } = await snekfetch.get('http://api.yomomma.info');
		return msg.sendMessage(`📢 **Yomomma joke:** *${JSON.parse(text).joke}*`);
	}

};