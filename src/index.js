const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const client = new Discord.Client();
const dispatchmap = {}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

client.on('message',async msg => {

  if(msg.content.startsWith('$')){
    const command = msg.content.split(/\s+/)[0];

    switch(command){
      
      case '$play':  
        if(!msg.member.voice.channel){
            msg.channel.send('Join a Voice Channel');
            return;
          }
          
        const[cmd,link] = msg.content.split(/\s+/);

        if(link === '' || link === 'undefined'){
          msg.channel.send('Invalid Link');
          return;
        }

        try{
          const connection = await msg.member.voice.channel.join()
          const dispatcher = connection.play(ytdl(link,{filter:'audioonly'}));
          if(dispatchmap[msg.guild.id] === undefined){
            dispatchmap[msg.guild.id] = {}
          }
          dispatchmap[msg.guild.id].current = dispatcher;
          dispatcher.on('finish',() => {
            dispatcher.destroy();
            dispatchmap[msg.guild.id].current = undefined;
          })
        }catch(e){
          msg.channel.send('Invalid Link');
        }
        break;

      case '$stop':
        if(dispatchmap[msg.guild.id] === undefined || dispatchmap[msg.guild.id].current === undefined){
          msg.channel.send('No music to stop');
          return;
        }
        dispatchmap[msg.guild.id].current.destroy();
        dispatchmap[msg.guild.id].current = undefined;
        break;

      case '$pause':
        if(dispatchmap[msg.guild.id] === undefined || dispatchmap[msg.guild.id].current === undefined){
          msg.channel.send('No music to pause');
          return;
        }

        if(dispatchmap[msg.guild.id].current.paused){
          msg.channel.send('Already paused');
          return;
        }

        dispatchmap[msg.guild.id].current.pause();
        break;

      case '$resume':
        if(dispatchmap[msg.guild.id] === undefined || dispatchmap[msg.guild.id].current === undefined){
          msg.channel.send('No music to resume');
          return;
        }

        if(!dispatchmap[msg.guild.id].current.paused){
          msg.channel.send('Music not paused');
          return
        }

        dispatchmap[msg.guild.id].current.resume();
        break;

      case '$leave':
        if(!msg.member.voice.channel){
          msg.channel.send('Join the voice channel from which you want the bot to leave');
          return;
        }
        msg.member.voice.channel.leave();
        break;

      case '$help':
        msg.channel.send('To play a video:\n$play <YouTube link>\nTo pause a video:\n$pause\nTo resume a paused video:\n$resume\nTo stop a playing video:\n$stop');
        break;

      default:
        msg.channel.send('Invalid Command use "$help" to get list of available commands');
        break;
    }
  }

})

client.login(process.env.TOKEN);