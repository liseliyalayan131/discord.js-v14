const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song from YouTube')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('The song name or URL')
        .setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply();

    const query = interaction.options.getString('query');
    const player = useMainPlayer();
    const channel = interaction.member.voice.channel;

    if (!channel) return interaction.followUp({ content: 'You need to join a voice channel first!', ephemeral: true });

    const searchResult = await player.search(query, {
      requestedBy: interaction.user,
      searchEngine: 'youtube'
    });

    if (!searchResult || !searchResult.tracks.length) return interaction.followUp({ content: 'No results found!', ephemeral: true });

    const queue = player.nodes.create(interaction.guild, {
      metadata: {
        channel: interaction.channel
      }
    });

    try {
      if (!queue.connection) await queue.connect(channel);
    } catch {
      player.nodes.delete(interaction.guild.id);
      return interaction.followUp({ content: 'Could not join your voice channel!', ephemeral: true });
    }

    queue.addTrack(searchResult.tracks[0]);
    if (!queue.playing) await queue.node.play();

    const track = searchResult.tracks[0];
    const embed = new EmbedBuilder()
      .setTitle(':notes: Now Playing')
      .setDescription(`[${track.title}](${track.url})`)
      .setThumbnail(track.thumbnail)
      .setImage('https://i.imgur.com/2BMw9x9.png')
      .setColor(0x1DB954)
      .setFooter({ text: 'Enjoy your music!', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.followUp({ embeds: [embed] });
  },
};

