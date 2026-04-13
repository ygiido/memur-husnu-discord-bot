const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antilink-sistemi')
        .setDescription('Link koruma ve otomatik susturma sistemini ayarlar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option => option.setName('mute-rolu').setDescription('Ceza olarak verilecek Susturma rolü').setRequired(true))
        .addIntegerOption(option => option.setName('sure').setDescription('Otomatik susturma süresi (Dakika)').setRequired(true))
        .addBooleanOption(option => option.setName('durum').setDescription('Sistem açık mı olsun? (True/False)').setRequired(true)),

    async execute(interaction) {
        const muteRolu = interaction.options.getRole('mute-rolu');
        const sure = interaction.options.getInteger('sure');
        const durum = interaction.options.getBoolean('durum');
        const guildId = interaction.guild.id;

        const dataPath = path.join(__dirname, '../data.json');
        let db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        if (!db[guildId]) db[guildId] = {};
        db[guildId].muteRoleId = muteRolu.id;
        db[guildId].antilinkDuration = sure; 
        db[guildId].antilinkActive = durum;

        fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));

        await interaction.reply({ 
            content: `🛡️ **Anti-Link Sistemi Güncellendi**\n🔹 **Ceza Rolü:** ${muteRolu}\n⏳ **Ceza Süresi:** ${sure} Dakika\n🟢 **Durum:** ${durum ? 'Açık' : 'Kapalı'}`, 
            ephemeral: true 
        });
    },
};
