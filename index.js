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

// --- VERİTABANI YARDIMCI FONKSİYONU ---
const getGuildData = (guildId) => {
    const dataPath = path.join(__dirname, 'data.json');
    if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '{}');
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'))[guildId] || null;
};

// ================= 1. DÜZ METİN LOG SİSTEMİ =================
client.on('messageDelete', async (message) => {
    if (!message.guild || message.author?.bot) return;
    
    const settings = getGuildData(message.guild.id);
    if (!settings || !settings.logActive || !settings.logChannelId) return;

    const logChannel = message.guild.channels.cache.get(settings.logChannelId);
    if (logChannel) {
        const logMesaji = `🗑️ **Silinen Mesaj**\n👤 **Kullanıcı:** ${message.author} \`(${message.author.id})\`\n📍 **Kanal:** ${message.channel}\n💬 **İçerik:** ${message.content || '*[Sadece Görsel/Dosya]*'}\n──────────────────`;
        logChannel.send(logMesaji).catch(() => {});
    }
});

client.on('messageUpdate', async (oldMsg, newMsg) => {
    if (!oldMsg.guild || oldMsg.author?.bot || oldMsg.content === newMsg.content) return;
    
    const settings = getGuildData(oldMsg.guild.id);
    if (!settings || !settings.logActive || !settings.logChannelId) return;

    const logChannel = oldMsg.guild.channels.cache.get(settings.logChannelId);
    if (logChannel) {
        const logMesaji = `✏️ **Düzenlenen Mesaj**\n👤 **Kullanıcı:** ${oldMsg.author} \`(${oldMsg.author.id})\`\n📍 **Kanal:** ${oldMsg.channel}\n\n🔻 **Eski:** ${oldMsg.content || '*[Boş]*'}\n🔺 **Yeni:** ${newMsg.content || '*[Boş]*'}\n──────────────────`;
        logChannel.send(logMesaji).catch(() => {});
    }
});

// ================= 2. VE 3. MOTORLAR (MESAJ KONTROLLERİ) =================
const warnings = new Map();

client.on('messageCreate', async (message) => {
    // 1. TEMEL KONTROL
    if (!message.guild || message.author.bot || message.member.permissions.has('Administrator')) return;

    const settings = getGuildData(message.guild.id);
    if (!settings) return;

    // === CAPS LOCK ENGELLEME SİSTEMİ ===
    if (settings.capsActive && message.content.length > 5) {
        const harfler = message.content.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, '');
        if (harfler.length > 0) {
            const buyukHarfler = harfler.split('').filter(c => c === c.toUpperCase()).length;
            const oran = buyukHarfler / harfler.length;

            if (oran > 0.7) {
                await message.delete().catch(() => {});
                const uyari = await message.channel.send(`🔠 ${message.author}, lütfen sürekli büyük harf kullanarak bağırmayın!`);
                setTimeout(() => uyari.delete().catch(() => {}), 5000);
                return; 
            }
        }
    }

    // === ANTI-LINK VE OTOMATİK CEZA SİSTEMİ ===
    if (!settings.antilinkActive) return; 

    const linkRegex = /(https?:\/\/[^\s]+)/g;
    
    if (linkRegex.test(message.content)) {
        // Linki sil
        await message.delete().catch(() => {});

        // Log At
        if (settings.logActive && settings.logChannelId) {
            const logChannel = message.guild.channels.cache.get(settings.logChannelId);
            if (logChannel) {
                const logMesaji = `🚫 **Link Engellendi**\n👤 **Kullanıcı:** ${message.author} \`(${message.author.id})\`\n📍 **Kanal:** ${message.channel}\n🔗 **Atılan Link:** \`${message.content}\`\n──────────────────`;
                logChannel.send(logMesaji).catch(() => {});
            }
        }

        const muteRole = message.guild.roles.cache.get(settings.muteRoleId);
        
        // Zaten cezalıysa dur
        if (muteRole && message.member.roles.cache.has(muteRole.id)) return; 

        const userId = message.author.id;
        const currentWarn = (warnings.get(userId) || 0) + 1;
        warnings.set(userId, currentWarn);

        if (currentWarn >= 3) {
            if (muteRole) {
                const cezaSuresiDakika = settings.antilinkDuration || 10;
                const msCinsinden = cezaSuresiDakika * 60 * 1000;

                // Discord Timeout (Susturma) Uygula
                await message.member.timeout(msCinsinden, "3 Kez Link Paylaşımı").catch(() => {});
                // Rolü Ver
                await message.member.roles.add(muteRole).catch(() => {});

                message.channel.send(`🔒 ${message.author}, kuralları 3 kez ihlal ettiğiniz için **${cezaSuresiDakika} dakika** susturuldunuz.`);

                // Ceza Logu
                if (settings.logActive && settings.logChannelId) {
                    const logChannel = message.guild.channels.cache.get(settings.logChannelId);
                    if (logChannel) {
                        const logMesaji = `⚖️ **Otomatik Ceza**\n👤 **Kullanıcı:** ${message.author}\n⏳ **Süre:** ${cezaSuresiDakika} Dakika\n📝 **Sebep:** 3 Kez Link Paylaşımı\n──────────────────`;
                        logChannel.send(logMesaji).catch(() => {});
                    }
                }

                // SÜRE BİTİNCE OTOMATİK KURTARMA (TAKİP SİSTEMİ)
                setTimeout(async () => {
                    // Rolü Geri Al
                    await message.member.roles.remove(muteRole).catch(() => {});
                    
                    // Uyarıyı "2" yapıyoruz. Böylece adam cezasını çekip geldiğinde tekrar link atarsa, 
                    // uyarı sayısı direkt 3 olacak ve tekrar anında ceza yiyecek (Sadece 1 hakkı kalmış olacak).
                    warnings.set(userId, 2); 

                }, msCinsinden); 
            }
        } else {
            const msg = await message.channel.send(`⚠️ ${message.author}, bu sunucuda link paylaşamazsınız! (Kalan Hakkınız: ${3 - currentWarn})`);
            setTimeout(() => msg.delete().catch(() => {}), 5000);
        }
    }
});
           
client.login(process.env.TOKEN);
