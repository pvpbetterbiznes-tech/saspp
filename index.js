const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 10000;

const TOKEN = process.env.DISCORD_TOKEN; 
const GUILD_ID = "1286719822469795840"; 

app.use(cors());
app.use(express.json());

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// 1. Pobieranie WSZYSTKICH ról z serwera (Automatyczna synchronizacja)
app.get('/roles', async (req, res) => {
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const roles = guild.roles.cache
            .filter(r => r.name !== '@everyone' && !r.managed) // Filtrujemy techniczne role
            .sort((a, b) => b.position - a.position) // Sortowanie jak na Discordzie
            .map(r => ({
                id: r.id,
                name: r.name,
                color: r.hexColor,
                position: r.position
            }));
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Pobieranie danych użytkownika (Inspektor)
app.get('/user/:id', async (req, res) => {
    const userId = req.params.id;

    // Zabezpieczenie z Twoich instrukcji:
    if (userId === "1281873529549357082") {
        return res.json({ access: "denied", info: "Informacje utajnione dla bezpieczeństwa." });
    }

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(userId);
        
        const roles = member.roles.cache
            .filter(r => r.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(r => ({ name: r.name, color: r.hexColor }));

        res.json({
            found: true,
            username: member.user.tag,
            nickname: member.nickname || member.user.username,
            avatar: member.user.displayAvatarURL(),
            top_role: roles.length > 0 ? roles[0].name : "Brak",
            all_roles: roles
        });
    } catch (error) {
        res.status(404).json({ found: false, error: "Nie znaleziono osoby." });
    }
});

client.login(TOKEN);
app.listen(port, () => console.log(`📡 SASP SYNC SYSTEM na porcie ${port}`));
