const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    // Kilit kaldırdık ki yetki verdiğin rol de bu komutu menüde görebilsin
    data: new SlashCommandBuilder()
        .setName('yaz')
        .setDescription('Bota kanalda mesaj yazdırır.')
        .addStringOption(option => 
            option.setName('mesaj').setDescription('Yazdırılacak mesaj').setRequired(true)),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const dataPath = path.join(__dirname, '../data.json');
        
        let db = {};
        if (fs.existsSync(dataPath)) {
            db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        const settings = db[guildId] || {};
        const ozelRolId = settings.yazYetkiliRolId;

        // Yöneticiler ve kaydedilen role sahip olanlar kontrol ediliyor
        const hasAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        const hasRole = ozelRolId ? interaction.member.roles.cache.has(ozelRolId) : false;

        // İki yetkiden biri bile yoksa komutu engelle
        if (!hasAdmin && !hasRole) {
            return interaction.reply({ content: '🚫 Bu komutu kullanmaya yetkiniz bulunmuyor.', ephemeral: true });
        }

        const mesaj = interaction.options.getString('mesaj');
        await interaction.channel.send(mesaj);
        
        await interaction.reply({ content: '✅ Mesaj gönderildi.', ephemeral: true });
    },
};
