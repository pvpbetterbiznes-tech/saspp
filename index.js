const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once('ready', () => { console.log(`✅ Bot gotowy: ${client.user.tag}`); });

// API dla strony
app.get('/user/:id', async (req, res) => {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(req.params.id);
        const roles = member.roles.cache.map(r => r.name);
        res.json({ roles });
    } catch (e) { res.status(404).json({ error: "Błąd" }); }
});

client.login("MTQ3MjEzOTkzNTM4ODc5NTA4Nw.GaJY0d.BYl0po7LHZAFiZfR09n7bFUKt1reH85i7X3kH0");
app.listen(process.env.PORT || 3000);
