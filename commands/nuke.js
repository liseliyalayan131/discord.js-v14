const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Deletes the specified channel and creates a new channel with the same name and permissions.')
    .addChannelOption(option => 
      option.setName('channel')
        .setDescription('Channel to be nuked')
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');

    const confirmationEmbed = new EmbedBuilder()
      .setTitle('⚠️ Confirm Nuke')
      .setDescription(`Are you sure you want to nuke this channel (${channel.name})?\n\nAfter nuking, a new channel with the same name and permissions will be created.`)
      .setColor('#FF0000')
      .setTimestamp()
      .setFooter({ text: 'Please confirm within 15 seconds' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirmNuke')
          .setLabel('Confirm')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancelNuke')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [confirmationEmbed], components: [row], ephemeral: true });

    const filter = i => ['confirmNuke', 'cancelNuke'].includes(i.customId) && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
      await i.deferUpdate();
      if (i.customId === 'confirmNuke') {
        try {
          const channelPermissions = channel.permissionOverwrites.cache.map(overwrite => ({ allow: overwrite.allow.toArray(), deny: overwrite.deny.toArray(), id: overwrite.id }));
          const parentID = channel.parentId;
          const position = channel.position;

          await channel.delete();
          const newChannel = await interaction.guild.channels.create({
            name: channel.name,
            type: ChannelType.GuildText,
            parent: parentID,
            permissionOverwrites: channelPermissions
          });

          await newChannel.setPosition(position);

          const embed = new EmbedBuilder()
            .setTitle('💥 Channel Nuked')
            .setDescription(`Channel ${channel.name} has been nuked. A new channel with the same name and permissions has been created.`)
            .setColor('#FF0000')
            .setTimestamp();

          await newChannel.send({ embeds: [embed] });

          await interaction.editReply({ content: `${i.user.tag} nuked the channel successfully.`, embeds: [], components: [] });

          console.log(`${i.user.tag} nuked the channel ${channel.name} (ID: ${channel.id}).`);
        } catch (error) {
          console.error(error);
          await interaction.editReply({ content: 'An error occurred while nuking the channel. Please try again later.', embeds: [], components: [] });
        }
      }

      if (i.customId === 'cancelNuke') {
        const embed = new EmbedBuilder()
          .setTitle('✅ Nuke Cancelled')
          .setDescription('Nuke process has been cancelled.')
          .setColor('#00FF00')
          .setTimestamp();

        await interaction.editReply({ content: `${i.user.tag} cancelled the nuke.`, embeds: [embed], components: [] });

        console.log(`${i.user.tag} cancelled the nuke for the channel ${channel.name} (ID: ${channel.id}).`);
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        const embed = new EmbedBuilder()
          .setTitle('⌛ Nuke Timed Out')
          .setDescription('Operation timed out without any action.')
          .setColor('#FFA500')
          .setTimestamp();

        interaction.editReply({ embeds: [embed], components: [] });
      }
    });
  }
};
