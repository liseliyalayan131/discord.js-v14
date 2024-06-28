const db = require("croxydb");
const {
  Events,
  codeBlock,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
} = require("discord.js");
const { formatName } = require("../utils");
let names = require("../names.json");

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,

  async execute(member) {
    const registrationSystem = db.fetch(`registrationSystem_${member.guild.id}`);
    const withMember = db.fetch(`name_${member.id}`);

    if (registrationSystem) {
      const channel = member.guild.channels.cache.get(registrationSystem.channel);
      const log = member.guild.channels.cache.get(registrationSystem.log);
      const maleRole = member.guild.roles.cache.get(registrationSystem.maleRole);
      const femaleRole = member.guild.roles.cache.get(registrationSystem.femaleRole);
      const unregisteredRole = member.guild.roles.cache.get(registrationSystem.unregisteredRole);

      if (withMember) {
        let gender = names.find(
          (c) => c.name.toLowerCase() === withMember.name.split(" ")[0].toLowerCase()
        );

        try {
          if (gender && gender.sex === "E") {
            await member.roles.add(maleRole.id);
          } else if (gender && gender.sex === "K") {
            await member.roles.add(femaleRole.id);
          } else if (gender && gender.sex === "U") {
            await member.roles.add(maleRole.id);
          } else {
            await member.roles.add(maleRole.id);
          }

          await member.setNickname(`${withMember.name} | ${withMember.age}`);

          await log.send({
            embeds: [
              new EmbedBuilder()
                .setColor("Blue")
                .setAuthor({
                  name: member.user.tag,
                  iconURL: member.user.avatarURL(),
                })
                .setTitle("🦴 A user has registered")
                .setDescription(
                  "> A user has just rejoined the server."
                )
                .addFields([
                  {
                    name: "Registered user;",
                    value: `${codeBlock("yaml", member.user.tag)}`,
                    inline: true,
                  },
                  {
                    name: "Real name;",
                    value: `${codeBlock("yaml", withMember.name)}`,
                    inline: true,
                  },
                  {
                    name: "Real age;",
                    value: `${codeBlock("yaml", withMember.age)}`,
                    inline: true,
                  },
                ])
                .setFooter({
                  text: member.client.user.tag,
                  iconURL: member.client.user.avatarURL(),
                })
                .setTimestamp(),
            ],
          });
        } catch (error) {
          console.error(`Error during role re-assignment or nickname setting: ${error}`);
        }
      } else {
        try {
          await member.roles.add(unregisteredRole.id);
          console.log(`Assigned Unregistered Role to ${member.user.tag}`);

          await channel.send({
            content: `<@${member.id}>`,
            embeds: [
              new EmbedBuilder()
                .setColor("Blue")
                .setAuthor({
                  name: member.user.tag,
                  iconURL: member.user.avatarURL(),
                })
                .setTitle("👋 Hello valued user")
                .setDescription(
                  "> To access our server, you need to fill out the form below."
                )
                .setFooter({
                  text: member.client.user.tag,
                  iconURL: member.client.user.avatarURL(),
                })
                .setTimestamp(),
            ],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("register_" + member.user.id)
                  .setLabel("Fill out the form")
                  .setEmoji("🖋")
                  .setStyle(ButtonStyle.Secondary)
              ),
            ],
          });
        } catch (error) {
          console.error(`Error assigning Unregistered Role or sending message: ${error}`);
        }
      }
    }
  },
};
