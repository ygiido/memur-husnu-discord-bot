require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
client.afkList = new Collection(); // AFK olan kişileri burada aklında tutacak
const commandsArray = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsArray.push(command.data.toJSON());
    }
}

client.once('ready', async () => {
    console.log(`${client.user.tag} sahaya indi!`);
    
    const rest = new REST().setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commandsArray });
        console.log('Komutlar başarıyla yüklendi!');
    } catch (error) {
        console.error('Hata:', error);
    }
});

// AFK RADARI: Chatteki her mesajı dinleyen sistem
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // 1. KONTROL: Eğer mesajı yazan kişi AFK ise, onu AFK modundan çıkar
    if (client.afkList.has(message.author.id)) {
        client.afkList.delete(message.author.id);
        const yazi = await message.reply('Hoş geldin! AFK modundan çıktın.');
        setTimeout(() => yazi.delete().catch(() => {}), 5000); // 5 saniye sonra kendi mesajını siler
    }

    // 2. KONTROL: Eğer mesajda biri etiketlendiyse ve o kişi AFK ise cevap ver
    message.mentions.users.forEach(user => {
        if (client.afkList.has(user.id)) {
            const sebep = client.afkList.get(user.id);
            message.reply(`Zzz... **${user.username}** şu anda AFK. Sebep: **${sebep}**`);
        }
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Bir hata oluştu!', ephemeral: true });
    }
});

client.login(process.env.TOKEN);
