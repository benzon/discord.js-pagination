const i18n = require('i18n');

const paginationEmbed = async (msg, pages, emojiList = ['⏪', '⏩'], timeout = 120000) => {
	if (!msg && !msg.channel) throw new Error(i18n.__('Channel is inaccessible.'));
	if (!pages) throw new Error(i18n.__('Pages are not given.'));
	if (emojiList.length !== 2) throw new Error(i18n.__('Need two emojis.'));
	let page = 0;
	const curPage = await msg.channel.send(pages[page].setFooter(i18n.__('-------------------------------------------------- Page %s / %s --------------------------------------------------', page + 1, pages.length))).catch(function (e) { });
	for (const emoji of emojiList) await curPage.react(emoji);
	const reactionCollector = curPage.createReactionCollector(
		(reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot,
		{ time: timeout }
	);
	reactionCollector.on('collect', reaction => {
		reaction.users.remove(msg.author).catch(function (e) { });
		switch (reaction.emoji.name) {
			case emojiList[0]:
				page = page > 0 ? --page : pages.length - 1;
				break;
			case emojiList[1]:
				page = page + 1 < pages.length ? ++page : 0;
				break;
			default:
				break;
		}
		curPage.edit(pages[page].setFooter(i18n.__('-------------------------------------------------- Page %s / %s --------------------------------------------------', page + 1, pages.length))).catch(function (e) { });
	});
	reactionCollector.on('end', () => {
		if (!curPage.deleted) {
			curPage.reactions.removeAll().catch(function (e) { })
		}
	});
	return curPage;
};
module.exports = paginationEmbed;
