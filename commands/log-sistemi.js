const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log-sistemi')
        .setDescription('Mesaj silinme ve düzenlenme loglarını ayarlar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => option.setName('kanal').setDescription('Logların atılacağı kanal').setRequired(true))
        .addBooleanOption(option => option.setName('durum').setDescription('Sistem açık mı olsun? (True=Açık / False=Kapalı)').setRequired(true)),

    async execute(interaction) {
        const kanal = interaction.options.getChannel('kanal');
        const durum = interaction.options.getBoolean('durum');
        const guildId = interaction.guild.id;

        const dataPath = path.join(__dirname, '../data.json');
        let db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        if (!db[guildId]) db[guildId] = {};
        db[guildId].logChannelId = kanal.id;
        db[guildId].logActive = durum; 

        fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));

        await interaction.reply({ content: `✅ Log sistemi güncellendi.\n**Kanal:** ${kanal}\n**Durum:** ${durum ? 'Açık 🟢' : 'Kapalı 🔴'}`, ephemeral: true });
    },
};
