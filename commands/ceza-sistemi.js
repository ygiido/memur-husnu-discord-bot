const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ceza-sistemi')
        .setDescription('Manuel cezalandırma (Timeout) sistemini açar veya kapatır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption(option => option.setName('durum').setDescription('Sistem aktif olsun mu?').setRequired(true)),

    async execute(interaction) {
        const durum = interaction.options.getBoolean('durum');
        const guildId = interaction.guild.id;

        const dataPath = path.join(__dirname, '../data.json');
        let db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        if (!db[guildId]) db[guildId] = {};
        db[guildId].cezaActive = durum; 

        fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));

        await interaction.reply({ 
            content: `🔨 Cezalandırma sistemi **${durum ? 'AKTİF 🟢' : 'DEVRE DIŞI 🔴'}** hale getirildi.`, 
            ephemeral: true 
        });
    }
};
