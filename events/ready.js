const { REST, Routes, ActivityType } = require('discord.js');
const mongo = require('../database/mongo');
const chalk = require('chalk');
const figlet = require('figlet');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.clear();

    console.log(chalk.green(figlet.textSync('Harmoni', { horizontalLayout: 'full' })));

    console.log(chalk.blue(`Bot is online as ${chalk.bold(client.user.tag)}!`));

    const commands = client.commands.map(command => command.data.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
      console.log(chalk.yellow('Started refreshing application (/) commands.'));
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );
      console.log(chalk.green('Successfully reloaded application (/) commands.'));
    } catch (error) {
      console.error(chalk.red('Failed to reload application (/) commands:'), error);
    }

    mongo().then(() => {
      console.log(chalk.green('Connected to MongoDB'));
    }).catch(error => {
      console.error(chalk.red('Failed to connect to MongoDB:'), error);
    });

    const activities = [
      { name: 'i am being developed', type: ActivityType.Playing },
      { name: 'from dreamland', type: ActivityType.Playing },
      { name: 'discord.gg/harmoni', type: ActivityType.Listening },
    ];
    const statusOptions = ['online', 'idle', 'dnd'];

    client.user.setPresence({
      activities: [activities[Math.floor(Math.random() * activities.length)]],
      status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
    });
  },
};
