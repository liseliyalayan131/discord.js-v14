const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set the slowmode for the channel')
    .addIntegerOption(option => 
      option.setName('seconds')
        .setDescription('The slowmode interval in seconds')
        .setRequired(true)),
  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');

    if (seconds < 0 || seconds > 21600) {
      return interaction.reply({ content: 'Slowmode must be between 0 and 21600 seconds.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('Slowmode Set')
      .setDescription(`The slowmode interval for the channel is now ${seconds} seconds.`)
      .addFields(
        { name: 'Channel', value: interaction.channel.name, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Duration', value: `${seconds} seconds`, inline: true }
      )
      .setColor('#00ff00')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: 'Slowmode Command', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('disable_slowmode')
          .setLabel('Disable')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setLabel('Help')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.com/invite/harmoni')
      );

    try {
      await interaction.channel.setRateLimitPerUser(seconds);
      await interaction.reply({ embeds: [embed], components: [row] });

      const filter = i => i.customId === 'disable_slowmode' && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        if (i.customId === 'disable_slowmode') {
          await interaction.channel.setRateLimitPerUser(0);
          await i.update({ content: 'Slowmode disabled.', components: [], embeds: [] });
        }
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          interaction.editReply({ components: [] });
        }
      });
    } catch (error) {
      console.error(error);

      const errorEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('An error occurred while setting the slowmode.')
        .setColor('#ff0000')
        .setFooter({ text: 'Please try again later.', iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};

