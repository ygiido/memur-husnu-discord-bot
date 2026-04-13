const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yaz-ayar')
        .setDescription('/yaz komutunu kullanabilecek özel rolü belirler.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option => 
            option.setName('yetkili-rol').setDescription('Yetki verilecek rolü seçin').setRequired(true)),

    async execute(interaction) {
        const rol = interaction.options.getRole('yetkili-rol');
        const guildId = interaction.guild.id;

        const dataPath = path.join(__dirname, '../data.json');
        let db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        if (!db[guildId]) db[guildId] = {};
        db[guildId].yazYetkiliRolId = rol.id; // Rolü data.json'a kaydediyoruz

        fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));

        await interaction.reply({ 
            content: `✅ Başarılı! Artık \`/yaz\` komutunu yöneticilerin yanı sıra **${rol.name}** rolüne sahip kişiler de kullanabilecek.`, 
            ephemeral: true 
        });
    },
};
