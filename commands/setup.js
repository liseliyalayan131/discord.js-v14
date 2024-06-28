// commands/setup.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup a channel with an embed message and buttons')
    .addChannelOption(option => 
      option.setName('channel')
        .setDescription('The channel to send the embed message')
        .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Music Control')
      .setDescription('Use the buttons below to control the music.');

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('pause')
          .setLabel('Pause')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⏸️'),
        new ButtonBuilder()
          .setCustomId('skip')
          .setLabel('Skip')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('⏭️'),
        new ButtonBuilder()
          .setCustomId('stop')
          .setLabel('Stop')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('⏹️')
      );

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: `Music control message sent to ${channel}`, ephemeral: true });
  },
};
