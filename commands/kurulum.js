const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kurulum')
        .setDescription('Botun log ve mute sistemini ayarlar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => 
            option.setName('log-kanalı').setDescription('Logların tutulacağı kanal').setRequired(true))
        .addRoleOption(option => 
            option.setName('mute-rolü').setDescription('Susturma için kullanılacak rol').setRequired(true)),

    async execute(interaction) {
        const logChannel = interaction.options.getChannel('log-kanalı');
        const muteRole = interaction.options.getRole('mute-rolü');
        const guildId = interaction.guild.id;

        const dataPath = path.join(__dirname, '../data.json');
        let db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // Sunucuya özel verileri kaydet
        db[guildId] = {
            logChannelId: logChannel.id,
            muteRoleId: muteRole.id
        };

        fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('✅ Kurulum Başarılı')
            .setDescription(`Bu sunucu için yapılandırma tamamlandı!\n\n**Log Kanalı:** ${logChannel}\n**Mute Rolü:** ${muteRole}`)
            .setFooter({ text: 'Memur Hüsnü Görev Başında' });

        await interaction.reply({ embeds: [embed] });
    },
};
