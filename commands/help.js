const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays all available commands and their descriptions.'),
  async execute(interaction) {
    const commands = interaction.client.commands;
    
    const helpEmbed = new EmbedBuilder()
      .setTitle('📚 Help Menu')
      .setDescription('Here are all the available commands:')
      .setColor('#0099ff')
      .setTimestamp()
      .setThumbnail(interaction.client.user.avatarURL())
      .setFooter({ text: 'Help command executed', iconURL: interaction.client.user.avatarURL() });

    commands.forEach(command => {
      helpEmbed.addFields({ name: `/${command.data.name}`, value: command.data.description, inline: true });
    });

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  },
};
