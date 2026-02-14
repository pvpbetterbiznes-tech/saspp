const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

// Konfiguracja Bota
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

// --- SERWER API (Widok w przeglądarce) ---

// Strona Główna - Status bota
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #5865F2;">🤖 System SASP Online</h1>
            <p>Bot <b>${client.user ? client.user.tag : 'Inicjalizacja...'}</b> działa poprawnie.</p>
            <p>Status połączenia: <span style="color: green;">Połączono z Discord</span></p>
            <hr style="width: 200px; margin: 20px auto;">
            <small>Aby sprawdzić role, użyj: /user/ID_UZYTKOWNIKA</small>
        </div>
    `);
});

// Pobieranie ról użytkownika
app.get('/user/:id', async (req, res) => {
    const userId = req.params.id;
    console.log(`[LOG] Zapytanie o role dla użytkownika: ${userId}`);

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(userId);
        const roles = member.roles.cache
            .filter(role => role.name !== '@everyone')
            .map(role => role.name);

        console.log(`[LOG] Sukces! Znaleziono role: ${roles.join(', ')}`);
        res.json({
            username: member.user.tag,
            roles: roles
        });
    } catch (error) {
        console.error(`[ERROR] Problem z pobraniem danych: ${error.message}`);
        res.status(404).json({ error: "Nie znaleziono użytkownika na serwerze lub błędne ID" });
    }
});

// --- URUCHOMIENIE ---

client.once('ready', () => {
    console.log('--------------------------------------');
    console.log(`✅ Zalogowano jako: ${client.user.tag}`);
    console.log(`🏠 Serwer (Guild ID): ${GUILD_ID}`);
    console.log(`🚀 API: https://saspp.onrender.com`);
    console.log('--------------------------------------');
});

client.login(TOKEN);

app.listen(port, () => {
    console.log(`📡 Serwer HTTP nasłuchuje na porcie ${port}`);
});
