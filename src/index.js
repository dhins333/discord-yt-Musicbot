const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const Queue = require('./queue');

const client = new Discord.Client();
const dispatchmap = {}
const queue = new Queue();

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

      case '$add':
        const [addCmd,addLink] = msg.content.split(/\s+/);
        if(addLink === '' || addLink === undefined){
          msg.channel.send('Invalid Link');
          return;
        }

        try{
          ytdl(addLink,{filter:'audioonly'});
        }catch(e){
          msg.channel.send('Invalid Link');
          return;
        }

        if(dispatchmap[msg.guild.id] === undefined){
          dispatchmap[msg.guild.id] = {};
          dispatchmap[msg.guild.id].queue = new Queue();
        }
        else if(dispatchmap[msg.guild.id].queue === undefined){
          dispatchmap[msg.guild.id].queue = new Queue();
        }
        dispatchmap[msg.guild.id].queue.enqueue(addLink);
        msg.channel.send(`${addLink} added to queue`);
        
        break;
  
      case '$queueplay':
        if(!msg.member.voice.channel){
          msg.channel.send('Join a Voice Channel');
          return;
        }

        if(dispatchmap[msg.guild.id] === undefined || dispatchmap[msg.guild.id].queue === undefined || dispatchmap[msg.guild.id].queue.start === undefined ){
          msg.channel.send('Queue Empty');
          return;
        }

        dispatchmap[msg.guild.id].queueconnection = await msg.member.voice.channel.join();
        const first = dispatchmap[msg.guild.id].queue.dequeue().data;
        msg.channel.send(`Now Playing ${first}`);

        break;

      case '$help':
        msg.channel.send('1.To play a video:\n$play <YouTube link>\n2.To pause a video:\n$pause\n3.To resume a paused video:\n$resume\n4.To stop a playing video:\n$stop\n5.To add a video to the queue\n$add <YouTube link>\n6.To play the queue\n$queueplay');
        break;

      default:
        msg.channel.send('Invalid Command use "$help" to get list of available commands');
        break;

    }
  }

  if(msg.content.startsWith('Now Playing') && msg.member.id === process.env.ID){
      
    const nowConnection = dispatchmap[msg.guild.id].queueconnection;
    const nowLink = msg.content.split(' ')[2];
    const nowDispatcher = nowConnection.play(ytdl(nowLink,{filter:'audioonly'}));
    dispatchmap[msg.guild.id].current = nowDispatcher;

    nowDispatcher.on('finish',() => {
      const next = dispatchmap[msg.guild.id].queue.dequeue();
      if(next !== 'Queue Empty'){
        msg.channel.send(`Now Playing ${next.data}`);
      }
      else{
        nowDispatcher.destroy();
        dispatchmap[msg.guild.id].current = undefined;
      }
    })
    
  }

})

client.login(process.env.TOKEN);