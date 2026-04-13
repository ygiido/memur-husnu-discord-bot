const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('caps-engel')
        .setDescription('Büyük harf (Caps Lock) engelleme sistemini açar veya kapatır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption(option => option.setName('durum').setDescription('Sistem açık mı olsun? (True=Açık / False=Kapalı)').setRequired(true)),

    async execute(interaction) {
        const durum = interaction.options.getBoolean('durum');
        const guildId = interaction.guild.id;

        const dataPath = path.join(__dirname, '../data.json');
        let db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        if (!db[guildId]) db[guildId] = {};
        db[guildId].capsActive = durum; // Aç/Kapat durumunu kaydediyoruz

        fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));

        await interaction.reply({ 
            content: `🔠 Caps Lock engelleme sistemi **${durum ? 'AÇIK 🟢' : 'KAPALI 🔴'}** olarak ayarlandı.`, 
            ephemeral: true 
        });
    }
};
