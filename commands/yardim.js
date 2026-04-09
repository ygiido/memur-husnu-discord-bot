const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardim')
        .setDescription('Botun sahip olduğu tüm komutları menü halinde gösterir.'),
    async execute(interaction) {
        // Botun sistemindeki tüm komutları otomatik olarak çekiyoruz
        const komutlar = interaction.client.commands;
        
        // Komutları alt alta düzgün bir metin haline getiriyoruz
        const komutListesi = komutlar.map(komut => `🔹 **/${komut.data.name}** - ${komut.data.description}`).join('\n\n');

        // Şık bir Discord menüsü (Embed) hazırlıyoruz
        const embed = new EmbedBuilder()
            .setColor('#00b0f4') // Hoş bir mavi tonu
            .setTitle('🤖 Komut Menüsü')
            .setDescription(`Aşağıda benimle yapabileceğin her şeyin bir listesi var:\n\n${komutListesi}`)
            .setThumbnail(interaction.client.user.displayAvatarURL()) // Sağ üste botun kendi resmini koyar
            .setFooter({ text: `${interaction.user.username} tarafından istendi.`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        // Menüyü chate gönder
        await interaction.reply({ embeds: [embed] });
    },
};
