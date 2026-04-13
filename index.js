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

const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

// Veritabanı okuma fonksiyonu
const getGuildData = (guildId) => {
    const dataPath = path.join(__dirname, 'data.json');
    const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return db[guildId] || null;
};

// --- LOG SİSTEMİ ---
client.on('messageDelete', async (message) => {
    if (!message.guild || message.author?.bot) return;
    const settings = getGuildData(message.guild.id);
    if (!settings || !settings.logChannelId) return;

    const logChannel = message.guild.channels.cache.get(settings.logChannelId);
    if (logChannel) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTitle('🗑️ Mesaj Silindi')
            .addFields(
                { name: 'Kanal', value: `${message.channel}`, inline: true },
                { name: 'İçerik', value: message.content || '*İçerik bulunamadı*' }
            )
            .setTimestamp();
        logChannel.send({ embeds: [embed] });
    }
});

client.on('messageUpdate', async (oldMsg, newMsg) => {
    if (!oldMsg.guild || oldMsg.author?.bot || oldMsg.content === newMsg.content) return;
    const settings = getGuildData(oldMsg.guild.id);
    if (!settings || !settings.logChannelId) return;

    const logChannel = oldMsg.guild.channels.cache.get(settings.logChannelId);
    if (logChannel) {
        const embed = new EmbedBuilder()
            .setColor('Yellow')
            .setAuthor({ name: oldMsg.author.tag, iconURL: oldMsg.author.displayAvatarURL() })
            .setTitle('✏️ Mesaj Düzenlendi')
            .addFields(
                { name: 'Eski Hali', value: oldMsg.content || '*Boş*' },
                { name: 'Yeni Hali', value: newMsg.content || '*Boş*' }
            )
            .setTimestamp();
        logChannel.send({ embeds: [embed] });
    }
});

// --- ANTİ-LİNK VE UYARI SİSTEMİ ---
const warnings = new Map();

client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot || message.member.permissions.has('Administrator')) return;

    const linkRegex = /(https?:\/\/[^\s]+)/g;
    if (linkRegex.test(message.content)) {
        const settings = getGuildData(message.guild.id);
        if (!settings) return;

        await message.delete().catch(() => {});
        
        const userId = message.author.id;
        const currentWarn = (warnings.get(userId) || 0) + 1;
        warnings.set(userId, currentWarn);

        if (currentWarn >= 3) {
            const muteRole = message.guild.roles.cache.get(settings.muteRoleId);
            if (muteRole) {
                await message.member.roles.add(muteRole).catch(() => {});
                const muteEmbed = new EmbedBuilder()
                    .setColor('DarkRed')
                    .setTitle('🔒 Susturuldu')
                    .setDescription(`${message.author}, 3 kez link paylaştığın için susturma rolü verildi.`)
                    .setTimestamp();
                message.channel.send({ embeds: [muteEmbed] });
                warnings.delete(userId);
            }
        } else {
            const warnEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('⚠️ Link Yasak')
                .setDescription(`${message.author}, bu sunucuda link paylaşamazsın!\n**Kalan Uyarı Hakkın:** \`${3 - currentWarn}\``);
            
            const msg = await message.channel.send({ embeds: [warnEmbed] });
            setTimeout(() => msg.delete().catch(() => {}), 5000);
        }
    }
});

client.login(process.env.TOKEN);
