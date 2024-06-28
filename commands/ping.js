const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong and shows the bot\'s latency.'),
  async execute(interaction) {
    const sent = await interaction.deferReply({ fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setDescription('Here are the latency details:')
      .addFields(
        { name: 'Latency', value: `${latency}ms`, inline: true },
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
      )
      .setColor('#00FF00')
      .setTimestamp()
      .setFooter({ text: 'Ping command executed', iconURL: interaction.client.user.avatarURL() })
      .setThumbnail(interaction.client.user.avatarURL())

    await interaction.editReply({ embeds: [embed] });
  },
};
