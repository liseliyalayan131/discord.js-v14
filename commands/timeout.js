const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const Timeout = require('../database/timeout');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member for a specified duration.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to timeout')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration of the timeout (e.g., 10m, 1h, 1d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the timeout')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Permission Denied')
            .setDescription('You do not have permission to use this command.')
            .setColor(0xFF0000)
            .setTimestamp()
        ],
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('user');
    const duration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id);

    if (!member) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('User Not Found')
            .setDescription('The user specified could not be found in this server.')
            .setColor(0xFF0000)
            .setTimestamp()
        ],
        ephemeral: true
      });
    }

    const timeoutUntil = new Date(Date.now() + ms(duration));

    try {
      await member.timeout(ms(duration), reason);

      const timeoutData = new Timeout({
        userId: user.id,
        guildId: interaction.guild.id,
        timeoutUntil,
        reason
      });
      await timeoutData.save();

      const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTitle('User Timeout')
        .setDescription(`${user.tag} has been timed out for ${duration}.`)
        .setColor(0x00FF00)
        .addFields(
          { name: 'Reason', value: reason, inline: true },
          { name: 'Timeout Until', value: timeoutUntil.toLocaleString(), inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Timeout System', iconURL: interaction.client.user.displayAvatarURL() });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('An error occurred while trying to timeout the user.')
            .setColor(0xFF0000)
            .setTimestamp()
        ],
        ephemeral: true
      });
    }
  },
};

