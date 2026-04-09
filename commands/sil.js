const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Kanaldaki mesajları topluca siler.')
        .addIntegerOption(option => 
            option.setName('miktar')
                .setDescription('Kaç mesaj silinecek? (1-100 arası)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const miktar = interaction.options.getInteger('miktar');
        
        // Mesajları silme komutu
        await interaction.channel.bulkDelete(miktar, true);
        
        // Komutu kullanana gizli bilgi ver
        await interaction.reply({ content: `🧹 Temizlik yapıldı! **${miktar}** adet mesaj uzaya fırlatıldı.`, ephemeral: true });
    },
};
