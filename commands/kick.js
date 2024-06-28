const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a member from the server.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for kicking the member')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has('KICK_MEMBERS')) {
      return interaction.reply('You do not have permission to kick members.');
    }

    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = interaction.guild.members.cache.get(target.id);
    if (!member) {
      return interaction.reply('The user is not a member of this server.');
    }

    await member.kick(reason);

    const embed = new EmbedBuilder()
      .setTitle('👢 Member Kicked')
      .setDescription(`**${target.tag}** has been kicked.`)
      .addFields(
        { name: 'Reason', value: reason, inline: true },
        { name: 'Kicked by', value: interaction.user.tag, inline: true }
      )
      .setColor('#FFA500')
      .setTimestamp()
      .setThumbnail(target.avatarURL());

    await interaction.reply({ embeds: [embed] });
  },
};
