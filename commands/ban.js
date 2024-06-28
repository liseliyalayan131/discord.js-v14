const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a member from the server.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for banning the member')
        .setRequired(true)),
  async execute(interaction) {
    try {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply({ content: 'You do not have permission to ban members.', ephemeral: true });
      }

      const target = interaction.options.getUser('target');
      const reason = interaction.options.getString('reason') || 'No reason provided';

      const member = await interaction.guild.members.fetch(target.id);
      if (!member) {
        return interaction.reply({ content: 'The user is not a member of this server.', ephemeral: true });
      }

      if (member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply({ content: 'You cannot ban this member.', ephemeral: true });
      }

      const confirmationEmbed = new EmbedBuilder()
        .setTitle('🚫 Confirm Ban')
        .setDescription(`Are you sure you want to ban **${target.tag}**?`)
        .setColor('#FF0000')
        .setTimestamp()
        .setThumbnail(target.avatarURL());

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('confirmBan')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('cancelBan')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.reply({ embeds: [confirmationEmbed], components: [row], ephemeral: true });

      const filter = i => ['confirmBan', 'cancelBan'].includes(i.customId) && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', async i => {
        try {
          if (i.customId === 'confirmBan') {
            await member.ban({ reason });

            const embed = new EmbedBuilder()
              .setTitle('🚫 Member Banned')
              .setDescription(`**${target.tag}** has been banned.`)
              .addFields(
                { name: 'Reason', value: reason, inline: true },
                { name: 'Banned by', value: interaction.user.tag, inline: true }
              )
              .setColor('#FF0000')
              .setTimestamp()
              .setThumbnail(target.avatarURL());

            await i.update({ embeds: [embed], components: [], ephemeral: true });

            const logEmbed = new EmbedBuilder()
              .setTitle('🚫 Member Banned')
              .setDescription(`**${target.tag}** has been banned.`)
              .addFields(
                { name: 'Reason', value: reason, inline: true },
                { name: 'Banned by', value: interaction.user.tag, inline: true }
              )
              .setColor('#FF0000')
              .setTimestamp()
              .setThumbnail(target.avatarURL());

            const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'log-channel');
            if (logChannel) {
              await logChannel.send({ embeds: [logEmbed] });
            }
          } else if (i.customId === 'cancelBan') {
            await i.update({ content: 'Ban action cancelled.', components: [], ephemeral: true });
          }
        } catch (error) {
          console.error(error);
          await i.followUp({ content: 'An error occurred while processing the interaction.', ephemeral: true });
        }
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          interaction.editReply({ content: 'No interaction received. Ban action cancelled.', components: [], ephemeral: true });
        }
      });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true });
    }
  },
};
