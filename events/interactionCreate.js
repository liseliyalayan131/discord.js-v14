const { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const db = require("croxydb");
const fs = require("fs");
const { formatName } = require("../utils");

let names = require("../names.json");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      const player = interaction.client.player;
      const queue = player.nodes.get(interaction.guild.id);

      if (!queue) {
        return interaction.reply({ content: 'No music is being played!', ephemeral: true });
      }

      if (interaction.customId === 'pause') {
        if (queue.node.isPlaying()) {
          queue.node.setPaused(true);
          await interaction.reply({ content: 'Track paused.', ephemeral: true });
        } else {
          queue.node.setPaused(false);
          await interaction.reply({ content: 'Track resumed.', ephemeral: true });
        }
      } else if (interaction.customId === 'skip') {
        queue.node.skip();
        await interaction.reply({ content: 'Track skipped.', ephemeral: true });
      } else if (interaction.customId === 'stop') {
        queue.node.stop();
        if (queue.connection) {
          queue.connection.disconnect();
        }
        await interaction.reply({ content: 'Stopped the music, cleared the queue, and disconnected from the voice channel!', ephemeral: true });
      } else if (interaction.customId.startsWith("register_")) {
        const modal = new ModalBuilder()
          .setCustomId("register")
          .setTitle("Registration Process");

        const nameInput = new TextInputBuilder()
          .setCustomId("name")
          .setLabel("What is your real name?")
          .setStyle(TextInputStyle.Short);

        const ageInput = new TextInputBuilder()
          .setCustomId("age")
          .setLabel("What is your real age?")
          .setStyle(TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
        const secondActionRow = new ActionRowBuilder().addComponents(ageInput);

        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === "register") {
        const name = interaction.fields.getTextInputValue("name");
        const age = interaction.fields.getTextInputValue("age");

        const registrationSystem = db.fetch(`registrationSystem_${interaction.guild.id}`);
        const nameData = name
          .split(" ")
          .every((d) =>
            names.some(
              (x) =>
                x.name === d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()
            )
          );

        if (!nameData)
          return interaction.reply({
            content: "❌ **|** Please enter your real name.",
            ephemeral: true,
          });
        if (name.split(" ").length > 2)
          return interaction.reply({
            content: "❌ **|** Your name cannot be more than 2 words.",
            ephemeral: true,
          });
        if (isNaN(Number(age)) || Number(age) < 10 || Number(age) > 50)
          return interaction.reply({
            content: "❌ **|** Please enter your real age.",
            ephemeral: true,
          });

        if (registrationSystem) {
          const channel = interaction.guild.channels.cache.get(
            registrationSystem.channel
          );
          const log = interaction.guild.channels.cache.get(registrationSystem.log);
          const maleRole = interaction.guild.roles.cache.get(
            registrationSystem.maleRole
          );
          const femaleRole = interaction.guild.roles.cache.get(
            registrationSystem.femaleRole
          );
          const unregisteredRole = interaction.guild.roles.cache.get(
            registrationSystem.unregisteredRole
          );

          if (channel && log && maleRole && femaleRole && unregisteredRole) {
            let formattedName = formatName(name).formattedName;
            let gender = names.find(
              (c) => c.name.toLowerCase() === name.split(" ")[0].toLowerCase()
            );

            try {
              await interaction.member.roles.remove(unregisteredRole.id);

              if (gender && gender.sex === "E") {
                await interaction.member.roles.add(maleRole.id);
              } else if (gender && gender.sex === "K") {
                await interaction.member.roles.add(femaleRole.id);
              } else if (gender && gender.sex === "U") {
                await interaction.member.roles.add(maleRole.id);
              } else {
                await interaction.member.roles.add(maleRole.id);
              }

              await interaction.member.setNickname(`${formattedName} | ${age}`);

              db.set(`name_${interaction.member.id}`, {
                name: formattedName,
                age: age,
              });

              await log.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor("Blue")
                    .setAuthor({
                      name: interaction.user.tag,
                      iconURL: interaction.user.avatarURL(),
                    })
                    .setTitle("🦴 A user has registered")
                    .setDescription(
                      "> A user has just registered on the server."
                    )
                    .addFields([
                      {
                        name: "Registered user;",
                        value: `${codeBlock("yaml", interaction.user.tag)}`,
                        inline: true,
                      },
                      {
                        name: "Real name;",
                        value: `${codeBlock("yaml", formattedName)}`,
                        inline: true,
                      },
                      {
                        name: "Real age;",
                        value: `${codeBlock("yaml", age)}`,
                        inline: true,
                      },
                    ])
                    .setFooter({
                      text: interaction.client.user.tag,
                      iconURL: interaction.client.user.avatarURL(),
                    })
                    .setTimestamp(),
                ],
              });

              await interaction.message.edit({
                embeds: [
                  new EmbedBuilder()
                    .setColor("Green")
                    .setAuthor({
                      name: interaction.user.tag,
                      iconURL: interaction.user.avatarURL(),
                    })
                    .setTitle("✅ Welcome to the server!")
                    .setDescription(
                      "> You can now chat and participate in activities in our server."
                    )
                    .setFooter({
                      text: interaction.client.user.tag,
                      iconURL: interaction.client.user.avatarURL(),
                    })
                    .setTimestamp(),
                ],
                components: [
                  new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId("register_" + interaction.user.id)
                      .setLabel("Fill out the form")
                      .setEmoji("🖋")
                      .setStyle(ButtonStyle.Secondary)
                      .setDisabled(true)
                  ),
                ],
              });

              await interaction.reply({
                content: `✅ **|** Welcome to the server, **${formattedName}**!`,
                ephemeral: true,
              });
            } catch (error) {
              console.error(`Error during role assignment or nickname setting: ${error}`);
              await interaction.reply({
                content: "❌ **|** There was an error during the registration process. Please try again.",
                ephemeral: true,
              });
            }
          }
        }
      }
    }
  },
};
