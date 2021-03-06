const { Command, util: { toTitleCase, codeBlock } } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 3,
			guarded: true,
			subcommands: true,
			description: (message) => message.language.get('COMMAND_CONF_SERVER_DESCRIPTION'),
			usage: '<set|show|remove|reset> (key:key) (value:value) [...]',
			usageDelim: ' '
		});

		this
			.createCustomResolver('key', (arg, possible, message, [action]) => {
				if (action === 'show' || arg) return arg;
				throw message.language.get('COMMAND_CONF_NOKEY');
			})
			.createCustomResolver('value', (arg, possible, message, [action]) => {
				if (!['set', 'remove'].includes(action) || arg) return arg;
				throw message.language.get('COMMAND_CONF_NOVALUE');
			});
	}

	show(message, [key]) {
		const path = this.client.gateways.guilds.getPath(key, { avoidUnconfigurable: true, errors: false, piece: null });
		if (!path) return message.sendMessage(message.language.get('COMMAND_CONF_GET_NOEXT', key));
		if (path.piece.type === 'Folder') {
			return message.sendMessage(message.language.get('COMMAND_CONF_SERVER', key ? `: ${key.split('.').map(toTitleCase).join('/')}` : '',
				codeBlock('asciidoc', message.guild.configs.list(message, path.piece))));
		}
		return message.sendMessage(message.language.get('COMMAND_CONF_GET', path.piece.path, message.guild.configs.resolveString(message, path.piece)));
	}

	async set(message, [key, ...valueToSet]) {
		const { errors, updated } = await message.guild.configs.update(key, valueToSet.join(' '), message.guild, { avoidUnconfigurable: true, action: 'add' });
		if (errors.length) return message.sendMessage(errors[0]);
		if (!updated.length) return message.sendMessage(message.language.get('COMMAND_CONF_NOCHANGE', key));
		return message.sendMessage(message.language.get('COMMAND_CONF_UPDATED', key, message.guild.configs.resolveString(message, updated[0].piece)));
	}

	async remove(message, [key, ...valueToRemove]) {
		const { errors, updated } = await message.guild.configs.update(key, valueToRemove.join(' '), message.guild, { avoidUnconfigurable: true, action: 'remove' });
		if (errors.length) return message.sendMessage(errors[0]);
		if (!updated.length) return message.sendMessage(message.language.get('COMMAND_CONF_NOCHANGE', key));
		return message.sendMessage(message.language.get('COMMAND_CONF_UPDATED', key, message.guild.configs.resolveString(message, updated[0].piece)));
	}

	async reset(message, [key]) {
		const { errors, updated } = await message.guild.configs.reset(key, message.guild, true);
		if (errors.length) return message.sendMessage(errors[0]);
		if (!updated.length) return message.sendMessage(message.language.get('COMMAND_CONF_NOCHANGE', key));
		return message.sendMessage(message.language.get('COMMAND_CONF_RESET', key, message.guild.configs.resolveString(message, updated[0].piece)));
	}

};