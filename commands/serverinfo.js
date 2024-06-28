const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Displays information about the server.'),
  async execute(interaction) {
    const guild = interaction.guild;

    const serverEmbed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle(`Server Information - ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'General Information', value: '---' },
        { name: 'Server Name', value: `${guild.name}`, inline: true },
        { name: 'Server ID', value: `${guild.id}`, inline: true },
        { name: 'Members and Channels', value: '---' },
        { name: 'Total Member Count', value: `${guild.memberCount}`, inline: true },
        { name: 'Total Channel Count', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Other Information', value: '---' },
        { name: 'Server Owner', value: `${(await guild.fetchOwner()).user.tag}`, inline: true },
        { name: 'Server Creation Date', value: `${guild.createdAt.toDateString()}`, inline: true },
        { name: 'Total Role Count', value: `${guild.roles.cache.size}`, inline: true }
      )
      .setThumbnail(interaction.client.user.avatarURL())
      .setTimestamp()
      .setFooter({ text: 'Server Info Command', iconURL: interaction.client.user.avatarURL() });

    await interaction.reply({ embeds: [serverEmbed], ephemeral: true });
  },
};
