const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Displays information about a user.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user you want information about')
        .setRequired(false)),
  async execute(interaction) {
    try {
      const target = interaction.options.getUser('target') || interaction.user;
      const member = await interaction.guild.members.fetch(target.id);

      if (!member) {
        return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
      }

      const userEmbed = createUserEmbed(target, member, interaction);

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('showAvatar')
            .setLabel('Show Avatar')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('showRoles')
            .setLabel('Show Roles')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.reply({ embeds: [userEmbed], components: [row], ephemeral: true });

      const filter = i => ['showAvatar', 'showRoles'].includes(i.customId) && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', async i => {
        try {
          if (i.customId === 'showAvatar') {
            const avatarEmbed = createAvatarEmbed(target, interaction);
            await i.update({ embeds: [userEmbed, avatarEmbed], components: [], ephemeral: true });
          } else if (i.customId === 'showRoles') {
            const rolesEmbed = createRolesEmbed(target, member, interaction);
            await i.update({ embeds: [userEmbed, rolesEmbed], components: [], ephemeral: true });
          }
        } catch (error) {
          console.error(error);
          await i.followUp({ content: 'An error occurred while processing the interaction.', ephemeral: true });
        }
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          interaction.editReply({ content: 'No interaction received. Please try again.', components: [], ephemeral: true });
        }
      });

    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true });
    }
  },
};

function createUserEmbed(target, member, interaction) {
  return new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`User Information - ${target.username}`)
    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: 'General Information', value: '---' },
      { name: 'Username', value: `${target.tag}`, inline: true },
      { name: 'User ID', value: `${target.id}`, inline: true },
      { name: 'Server Information', value: '---' },
      { name: 'Join Date', value: `${member.joinedAt.toDateString()}`, inline: true },
      { name: 'Account Creation Date', value: `${target.createdAt.toDateString()}`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'User Info Command', iconURL: interaction.client.user.avatarURL() });
}

function createAvatarEmbed(target, interaction) {
  return new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`${target.username}'s Avatar`)
    .setImage(target.displayAvatarURL({ dynamic: true, size: 512 }))
    .setTimestamp()
    .setFooter({ text: 'User Info Command', iconURL: interaction.client.user.avatarURL() });
}

function createRolesEmbed(target, member, interaction) {
  const roles = member.roles.cache
    .sort((a, b) => b.position - a.position)
    .map(role => `${role.name}`)
    .join(', ') || 'None';

  return new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`${target.username}'s Roles`)
    .setDescription(roles)
    .addFields(
      { name: 'Total Roles', value: `${member.roles.cache.size}`, inline: true },
      { name: 'Highest Role', value: `${member.roles.highest.name}`, inline: true }
    )
    .setTimestamp()
    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: 'User Info Command', iconURL: interaction.client.user.avatarURL() });
}
