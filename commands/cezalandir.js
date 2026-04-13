const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cezalandir')
        .setDescription('Bir kullanıcıya süreli susturma (Timeout) cezası verir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers) // Sadece üyeleri yönetme yetkisi olanlar
        .addUserOption(option => option.setName('kullanici').setDescription('Cezalandırılacak üye').setRequired(true))
        .addIntegerOption(option => option.setName('sure').setDescription('Kaç dakika susturulsun?').setRequired(true))
        .addStringOption(option => option.setName('sebep').setDescription('Ceza sebebi').setRequired(false)),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const dataPath = path.join(__dirname, '../data.json');
        const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // Sistem açık mı kontrol et
        if (!db[guildId]?.cezaActive) {
            return interaction.reply({ content: '🔴 Cezalandırma sistemi bu sunucuda kapalı.', ephemeral: true });
        }

        const hedef = interaction.options.getMember('kullanici');
        const sure = interaction.options.getInteger('sure');
        const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi.';

        if (!hedef) return interaction.reply({ content: 'Kullanıcı bulunamadı.', ephemeral: true });
        if (!hedef.moderatable) return interaction.reply({ content: 'Bu kullanıcıyı cezalandırmak için yetkim yetmiyor.', ephemeral: true });

        // Discord Timeout (Zaman Aşımı) uygula (milisaniye cinsinden)
        await hedef.timeout(sure * 60 * 1000, sebep);

        await interaction.reply({ content: `✅ ${hedef} kullanıcısı **${sure} dakika** boyunca susturuldu.\n**Sebep:** ${sebep}` });

        // LOGLAMA (Düz metin formatında)
        const logKanalId = db[guildId]?.logChannelId;
        const logActive = db[guildId]?.logActive;

        if (logActive && logKanalId) {
            const logChannel = interaction.guild.channels.cache.get(logKanalId);
            if (logChannel) {
                const logMesaji = `⚖️ **Disiplin İşlemi**\n👤 **Cezalandırılan:** ${hedef} \`(${hedef.id})\`\n👮 **Yetkili:** ${interaction.user}\n⏳ **Süre:** ${sure} Dakika\n📝 **Sebep:** ${sebep}\n──────────────────`;
                logChannel.send(logMesaji).catch(() => {});
            }
        }
    }
};
