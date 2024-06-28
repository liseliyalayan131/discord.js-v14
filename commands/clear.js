const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { Client, GatewayIntentBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Deletes a specified number of messages.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The number of messages to delete')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Deletes messages from a specific user')),
  async execute(interaction) {
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Permission Denied')
            .setDescription('You do not have permission to use this command.')
            .setColor(0xFF0000)
            .setTimestamp()
        ],
        ephemeral: true
      });
      return;
    }

    const amount = interaction.options.getInteger('amount');
    const user = interaction.options.getUser('user');

    if (amount <= 0) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Invalid Input')
            .setDescription('Please enter a number greater than 0.')
            .setColor(0xFF0000)
            .setTimestamp()
        ],
        ephemeral: true
      });
      return;
    }

    try {
      const fetchedMessages = await interaction.channel.messages.fetch({ limit: amount });
      let deletedMessages;

      if (user) {
        const userMessages = fetchedMessages.filter(msg => msg.author.id === user.id);
        deletedMessages = await interaction.channel.bulkDelete(userMessages, true);
      } else {
        deletedMessages = await interaction.channel.bulkDelete(fetchedMessages, true);
      }

      const embed = new EmbedBuilder()
        .setTitle('Deletion Successful!')
        .setDescription(`${deletedMessages.size} messages were successfully deleted.`)
        .setColor(0x00FF00)
        .setTimestamp()
        .setFooter({ text: 'Nuke Bot', iconURL: interaction.client.user.displayAvatarURL() })
        .addFields(
          { name: 'Deleted Messages', value: `${deletedMessages.size}`, inline: true },
          { name: 'Channel', value: interaction.channel.name, inline: true },
          { name: 'User', value: user ? user.tag : 'All', inline: true }
        )
        .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, format: 'gif' }));

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      if (error.message.includes('14 days')) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Error')
              .setDescription('Messages from more than 14 days ago cannot be deleted.')
              .setColor(0xFF0000)
              .setTimestamp()
          ],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Error')
              .setDescription('An error occurred while deleting messages.')
              .setColor(0xFF0000)
              .setTimestamp()
          ],
          ephemeral: true
        });
      }
    }
  }
};
