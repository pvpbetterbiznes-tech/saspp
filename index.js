const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors'); // Wymagane do komunikacji z panelem
const app = express();
const port = process.env.PORT || 10000;

// --- KONFIGURACJA ---
const TOKEN = process.env.DISCORD_TOKEN; 
// Twoje ID ustawione na sztywno:
const GUILD_ID = "1286719822469795840"; 

// Zmienna przechowująca konfigurację rang z panelu HTML
let saspConfig = []; 

// Konfiguracja Express
app.use(cors());
app.use(express.json());

// Konfiguracja Klienta Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// --- ENDPOINTY API ---

// 1. Status bota (Strona główna)
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #111; color: white;">
            <h1 style="color: #5865F2;">🤖 System SASP Online</h1>
            <p>Bot zalogowany na serwerze ID: <b>${GUILD_ID}</b></p>
            <p>Liczba skonfigurowanych rang: <b>${saspConfig.length}</b></p>
        </div>
    `);
});

// 2. Odbieranie konfiguracji z index.html (BEZ HASŁA)
app.post('/update-config', (req, res) => {
    saspConfig = req.body;
    console.log(`[CONFIG] Zaktualizowano listę rang. Nowa ilość: ${saspConfig.length}`);
    res.json({ status: "success", count: saspConfig.length });
});

// 3. Pobieranie ról użytkownika (Dla systemów zewnętrznych)
app.get('/user/:id', async (req, res) => {
    const userId = req.params.id;
    console.log(`[LOG] Sprawdzanie ID: ${userId}`);

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(userId);
        
        const memberRoles = member.roles.cache.map(r => r.name);

        // Filtrowanie: Pokazujemy tylko role, które są ustawione w Twoim panelu HTML
        // Jeśli saspConfig jest pusty (panel nieużywany), pokazuje wszystkie role (fallback)
        let finalRoles = [];
        
        if (saspConfig.length > 0) {
            finalRoles = saspConfig
                .filter(conf => memberRoles.includes(conf.name))
                .sort((a, b) => b.weight - a.weight); // Sortowanie wg ważności z panelu
        } else {
            finalRoles = memberRoles.map(r => ({ name: r })); // Fallback
        }

        res.json({
            username: member.user.tag,
            nickname: member.nickname || member.user.username,
            avatar: member.user.displayAvatarURL(),
            roles: finalRoles
        });

    } catch (error) {
        console.error(`[ERROR] ${error.message}`);
        res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }
});

// --- URUCHOMIENIE ---

client.once('ready', () => {
    console.log('--------------------------------------');
    console.log(`✅ Zalogowano jako: ${client.user.tag}`);
    console.log(`🏠 Serwer (Guild ID): ${GUILD_ID}`);
    console.log(`🚀 API gotowe do pracy`);
    console.log('--------------------------------------');
});

client.login(TOKEN);

app.listen(port, () => {
    console.log(`📡 Serwer HTTP nasłuchuje na porcie ${port}`);
});
