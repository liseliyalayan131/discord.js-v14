const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Displays the avatar of a user in different resolutions and formats')
        .addUserOption(option => option.setName('target').setDescription('The user\'s avatar to show')),

    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const avatarURL = user.displayAvatarURL({ dynamic: true, format: 'png' });
        const botAvatarURL = interaction.client.user.displayAvatarURL({ dynamic: true, format: 'png' });


        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setDescription(`**User Information**\n` +
                            `**Name:** ${user.username}#${user.discriminator}\n` +
                            `**ID:** ${user.id}\n` +
                            `**Account Creation Date:** ${user.createdAt.toDateString()}`)
            .setThumbnail(botAvatarURL)
            .setImage(avatarURL)
            .setColor('#0099ff')
            .setFooter({ text: 'Avatar Commands', iconURL: avatarURL })
            .setTimestamp()

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('PNG 128px')
                    .setURL(user.displayAvatarURL({ format: 'png', size: 128 }))
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('PNG 1024px')
                    .setURL(user.displayAvatarURL({ format: 'png', size: 1024 }))
                    .setStyle(ButtonStyle.Link)
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};
