const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

client.login(process.env.TOKEN);