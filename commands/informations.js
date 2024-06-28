const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('informations')
    .setDescription('Invite the bot to your server by providing a link.'),
  async execute(interaction) {
    const inviteLink = 'https://discord.com/oauth2/authorize?client_id=1246473008365830185&scope=bot&permissions=8';

    const embed = new EmbedBuilder()
      .setTitle('Invite the Bot')
      .setDescription('Hello, you can easily add the bot here and reach my social media addresses.')
      .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setFooter({ text: 'İnformations', iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp()
      .setColor('#FFA500')

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setStyle('Link')
        .setLabel('Invite')
        .setURL('https://discord.com/oauth2/authorize?client_id=1246473008365830185'),
        new ButtonBuilder()
          .setStyle('Link')
          .setLabel('GitHub')
          .setURL('https://github.com/emreconf/djs-altyapi'),
        new ButtonBuilder()
          .setStyle('Link')
          .setLabel('Instagram')
          .setURL('https://www.instagram.com/emreconf'),
      );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};

