const { SlashCommandBuilder } = require('@discordjs/builders');
const wikiapi = require('wikipedia');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search Wikipedia for a given query.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('the query to search for')
                .setRequired(true)),
    async execute(interaction) {
        let content = interaction.options.getString('query');
        try {
            let page = await wikiapi.page(content);
            let summary = await wikiapi.summary(content);
            // check if summary includes the content
            if (summary.extract.includes('may refer to:')) {
                interaction.reply({ content: '``I was unable to find what you were looking for ``😞' })
                return;
            }
            if (page) {
                // send the embed
                let embed = new MessageEmbed()
                    .setTitle(page.title)
                    .setURL(page.fullurl)
                    .setDescription(summary.extract)
                    .setColor('FFFFFF')
                    .setFooter('From Wikipedia');
                interaction.reply({ embeds: [embed] })
            }
        } catch (error) {
            console.log(error);
            interaction.reply({ content: '``I was unable to find what you were looking for ``😞' })

        }

    }
};