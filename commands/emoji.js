const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emoji')
    .setDescription('Downloads server emojis as a zip file with options.'),
  async execute(interaction) {
    const processingEmbed = new EmbedBuilder()
      .setTitle('⏳ Processing...')
      .setDescription('Select the type of emojis you want to download:')
      .setColor('#FFA500')
      .setTimestamp()
      .setFooter({ text: 'Emoji command executed', iconURL: interaction.client.user.avatarURL() });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('all')
          .setLabel('Download All Emojis')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('png')
          .setLabel('Download PNG Emojis')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('gif')
          .setLabel('Download GIF Emojis')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [processingEmbed], components: [row], ephemeral: true });

    const filter = i => i.customId === 'all' || i.customId === 'png' || i.customId === 'gif';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
      await i.deferUpdate();

      const tempDir = path.join(__dirname, 'tempEmojis');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const emojis = interaction.guild.emojis.cache;
      const downloadPromises = [];
      let fileExtensionFilter;

      if (i.customId === 'all') {
        fileExtensionFilter = () => true;
      } else if (i.customId === 'png') {
        fileExtensionFilter = (emoji) => !emoji.animated;
      } else if (i.customId === 'gif') {
        fileExtensionFilter = (emoji) => emoji.animated;
      }

      emojis.forEach(emoji => {
        const fileExtension = emoji.animated ? 'gif' : 'png';
        if (fileExtensionFilter(emoji)) {
          const filePath = path.join(tempDir, `${emoji.name}.${fileExtension}`);
          const emojiUrl = emoji.imageURL();

          downloadPromises.push(
            axios({
              url: emojiUrl,
              responseType: 'stream',
            }).then(response => {
              return new Promise((resolve, reject) => {
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
              });
            })
          );
        }
      });

      await Promise.all(downloadPromises);

      const zip = new AdmZip();
      zip.addLocalFolder(tempDir);

      const zipPath = path.join(__dirname, 'emojis.zip');
      zip.writeZip(zipPath);

      const resultEmbed = new EmbedBuilder()
        .setTitle('🎉 Emojis Downloaded')
        .setDescription(`The selected type of emojis have been zipped and are ready for download.`)
        .setColor('#00FF00')
        .setTimestamp()
        .setFooter({ text: 'Emoji command executed', iconURL: interaction.client.user.avatarURL() });

      await interaction.followUp({ embeds: [resultEmbed], files: [zipPath], ephemeral: true });

      fs.rmSync(tempDir, { recursive: true, force: true });
      fs.unlinkSync(zipPath);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: 'No selection made. Please try again.', components: [], ephemeral: true });
      }
    });
  },
};
