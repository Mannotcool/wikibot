const { Client, Collection, MessageEmbed } = require('discord.js');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const client = new Client({ intents: 32509 });
const keywords = ["what is", "what was", "where is", "where was", "when was", "when is", "who is", "who was"];
const config = require('./config.json');
const wikiapi = require('wikipedia');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const TEST_GUILD_ID = '';
const commands = [];

// Creating a collection for commands in client
client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

client.on("ready", () => {
    console.log('Successfully logged in as ' + client.user.tag);
    client.user.setActivity('Answering your questions... | /search', { type: 'PLAYING' });
    client.user.setPresence({
        status:'idle'
    });

    const CLIENT_ID = client.user.id;
    const rest = new REST({
        version: '9'
    }).setToken(config.token);
    (async () => {
        try {
            if (!TEST_GUILD_ID) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands globally');
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands for development guild');
            }
        } catch (error) {
            if (error) console.error(error);
        }
    })();
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on("messageCreate", async (message) => {
    // Select all messages that are not from the bot
    if (message.author.bot) return;
    // Check if the message contains keywords
    if (message.content === 'who is you') {
        let embed = new MessageEmbed()
        .setTitle('You')
        .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        .setDescription('yourself, dumbass')
        .setColor('FFFFFF')
        .setFooter('From Mannotcool#0001');
        message.reply({ embeds: [embed] })
        return
    }
    if (message.content === 'who is drinking') {
        let embed = new MessageEmbed()
        .setTitle('Drinking')
        .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        .setDescription(`Probably you, if you're asking this question.`)
        .setColor('FFFFFF')
        .setFooter('From Rowan#1610');
        message.reply({ embeds: [embed] })
        return
    }
    if (message.content === 'who made you') {
        let embed = new MessageEmbed()
        .setTitle('Mannotcool')
        .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        .setDescription('Mannotcool#0001 made me!')
        .setColor('FFFFFF')
        .setFooter('From Mannotcool#0001');
        message.reply({ embeds: [embed] })
        return
    }
    if (message.content === 'who is sus') {
        let embed = new MessageEmbed()
        .setTitle('RED')
        .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        .setDescription(`**RED IS IMPOSTER**`)
        .setColor('FF0000')
        .setFooter('From Rowan#1610');
        message.reply({ embeds: [embed] })
        return
    }
    for (let i = 0; i < keywords.length; i++) {
        if (message.content.toLowerCase().includes(keywords[i])) {
            // react to the message with a loading emoji
            message.react('⏳');
            // get the message content without the keyword
            let content = message.content.toLowerCase().replace(keywords[i], '').trim();
            content = content.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,"")
            try {
                let page = await wikiapi.page(content);
                let summary = await wikiapi.summary(content);
                let image = await wikiapi.images(content);
                // check if summary includes the content
                if (summary.extract.includes('may refer to:')) {
                    // remove all reactions
                    message.reactions.removeAll();
                     // react with a red cross
                    message.react('❓');
                    return;
                }
                if (page) {
                    // react with a check emoji and check if the author reacted with a check emoji
                    message.reactions.removeAll();
                    message.react('✅');
                    const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id && !user.bot; 
                    const collector = message.createReactionCollector({filter, time: 10000 });
                    collector.on('collect', () => {
                        // send the embed
                        let embed = new MessageEmbed()
                            .setTitle(page.title)
                            .setURL(page.fullurl)
                            .setDescription(summary.extract)
                            .setColor('FFFFFF')
                            .setFooter('From Wikipedia');
                        message.reply({ embeds: [embed] })
                        
                    });
                }
            } catch (error) {
                console.log(error);
                // remove all reactions
                message.reactions.removeAll();
                // react with a red cross
                message.react('❓');
            }
        }
    }
});

client.login(config.token);