require('dotenv').config();

console.log(process.env.DISCORDJS_BOT_TOKEN);
const { Client, MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');
const isUrl = require('isUrl')
const youtube = new YouTube('AIzaSyDCFB8ZoptNpQURCxCdQgsm_w-2rPbMsrQ');

const client = new Client();
const PREFIX = "-";
let servers = {}
const ravi = (connection, message) => {

    connection.play(ytdl('https://youtu.be/qGk4E9ss95s', { filter: "audioonly" }))
}

const play = (connection, message) => {
    var server = servers[message.guild.id]
    message.channel.send("Playing :notes: " + '`' + server.song[0].title + '`' + " - Now!")
    server.playing = true
    server.dispatcher = connection.play(ytdl(server.song[0].url, { filter: "audioonly" }))
    server.song.shift()
    server.dispatcher.on("end", () => {
        if (server.song[0]) {
            play(connection, message)
        } else {
            connection.disconnect()
            server.playing = false
        }
    })
}
const embedQueue = (result, message) => {
    var server = servers[message.guild.id]
    console.log(server, server.song.length - 1)
    const exampleEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(server.song[server.song.length - 1].title)
        .setURL(server.song[server.song.length - 1].url)
        .setAuthor('Added to queue', message.author.avatarURL(), 'https://discord.js.org')
        .setThumbnail(server.song[server.song.length - 1].thumbnails)
        .addFields(
            { name: 'Channel', value: 'Ravi Lamkoti', inline: true },
            { name: 'Song Duration', value: '4.50', inline: true },
        )
        .addField('Position in queue', 'Some value here')

        .setTimestamp()
    message.channel.send(exampleEmbed);
}
client.on('message', async (message) => {
    if (message.content.startsWith(PREFIX)) {
        const [CMD, ...args] = message.content.trim().substring(PREFIX.length).split(/\s+/)
        console.log(CMD, args)
        if (CMD === 'momo') {
            message.channel.send('<@' + message.author.id + `> has requested, 2 plate momos with ${args}`)
            message.channel.send('<@!511127608755355649>, 2 plate momos ' + `with ${args} please`)
        }
        if (CMD === 'play') {
            const voiceChannel = message.member.voice.channel;
            const channel = client.channels.cache.get(message.member.voice.channelID)
            if (!channel) {
                message.channel.send('<:got:762702913419345950> You have to be in a voice channel to use this command.')
                return;
            }
            const permissions = voiceChannel.permissionsFor(message.client.user);
            if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
                message.channel.send(
                    "I need the permissions to join and speak in your voice channel!"
                );
            }
            if (!servers[message.guild.id]) servers[message.guild.id] = {
                song: [],
                playing: false
            }
            var server = servers[message.guild.id];
            if (isUrl(args[0])) {

                youtube.searchVideos(args[0], 4)
                    .then(results => {
                        server.song.push({
                            url: args[0],
                            title: results[0].title,
                            thumbnails: results[0].thumbnails.default.url
                        })
                    })
                    .catch(e => console.log(e));
            } else {
                message.channel.send('<:youtube:773124739869966367> Searching :mag_right: ' + args.join(' '))
                youtube.searchVideos(args.join(' '), 4)
                    .then(results => {
                        if (results[0]['raw']['id']['kind'] === 'youtube#video') {
                            if (results[0]) {
                                server.song.push({
                                    url: `https://www.youtube.com/watch?v=${results[0]['raw']['id']['videoId']}`,
                                    title: results[0].title,
                                    thumbnails: results[0].thumbnails.default.url
                                })
                            }
                        }
                    })
                    .catch(console.log);
            }
            if (!server.playing) {
                channel.join().then(connection => {
                    message.channel.send(':thumbsup: Joined ' + '`' + connection.channel.name + '`' + ' :page_facing_up: And bound to ' + '`' + 'music' + '`')
                    play(connection, message);
                }).catch(e => {
                    console.log(e)
                    server.playing = false
                    message.channel.send('<:ohshit:762724796487303219> Cannot Play')
                });
            } else {
                console.log(server)
                embedQueue({}, message)
            }
        }
        if (CMD === 'skip') {
            var server = servers[message.guild.id]
            if (server.dispatcher) server.dispatcher.end()
        }
        if (CMD === 'ravi') {
            const channel = client.channels.cache.get(message.member.voice.channelID)
            if (!channel) {
                message.channel.send('<:got:762702913419345950> You have to be in a voice channel to use this command.')
                return;
            }
            channel.join().then(connection => {
                ravi(connection, message);
            }).catch(e => {
                console.error(e);
            });
        }
    }
})
client.login(process.env.DISCORDJS_BOT_TOKEN);