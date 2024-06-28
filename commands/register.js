const { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Set up or reset your server registration system.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand.setName('setup')
                .setDescription('Set up the registration system.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Specify a channel.')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('log')
                        .setDescription('Specify a log channel.')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('male_role')
                        .setDescription('Specify a male role.')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('female_role')
                        .setDescription('Specify a female role.')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('unregistered_role')
                        .setDescription('Specify an unregistered role.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('reset')
                .setDescription('Reset the registration system.')),
    
    async execute(interaction) {
        await interaction.deferReply();

        if (interaction.options.getSubcommand() === 'setup') {
            if (db.fetch(`registrationSystem_${interaction.guild.id}`)) {
                return interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                            .setTitle('❌ Something went wrong!')
                            .setDescription(`> Users are already registering in channel <#${db.fetch(`registrationSystem_${interaction.guild.id}`).channel}>!`)
                            .setFooter({ text: interaction.client.user.tag, iconURL: interaction.client.user.avatarURL() })
                            .setTimestamp()
                    ]
                });
            } else {
                const channel = interaction.options.getChannel('channel');
                const log = interaction.options.getChannel('log');
                const maleRole = interaction.options.getRole('male_role');
                const femaleRole = interaction.options.getRole('female_role');
                const unregisteredRole = interaction.options.getRole('unregistered_role');

                db.set(`registrationSystem_${interaction.guild.id}`, {
                    channel: channel.id,
                    log: log.id,
                    maleRole: maleRole.id,
                    femaleRole: femaleRole.id,
                    unregisteredRole: unregisteredRole.id
                });

                return interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Green')
                            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                            .setTitle('✅ Successfully registered!')
                            .setDescription(`> Users will now register in channel <#${channel.id}>!`)
                            .setFooter({ text: interaction.client.user.tag, iconURL: interaction.client.user.avatarURL() })
                            .setTimestamp()
                    ]
                });
            }
        } else if (interaction.options.getSubcommand() === 'reset') {
            if (!db.fetch(`registrationSystem_${interaction.guild.id}`)) {
                return interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                            .setTitle('❌ Something went wrong!')
                            .setDescription('> The registration system is already inactive for your server.')
                            .setFooter({ text: interaction.client.user.tag, iconURL: interaction.client.user.avatarURL() })
                            .setTimestamp()
                    ]
                });
            } else {
                db.delete(`registrationSystem_${interaction.guild.id}`);

                return interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Green')
                            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                            .setTitle('✅ Successfully reset!')
                            .setDescription('> The registration system has been disabled for users!')
                            .setFooter({ text: interaction.client.user.tag, iconURL: interaction.client.user.avatarURL() })
                            .setTimestamp()
                    ]
                });
            }
        }
    }
};
