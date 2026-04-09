const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Kullanıcının profil fotoğrafını büyük boyutta gösterir.')
        .addUserOption(option => 
            option.setName('kullanıcı')
                .setDescription('Avatarına bakmak istediğin kişi (Boş bırakırsan seninkini gösterir)')
                .setRequired(false)),
    async execute(interaction) {
        // Eğer kullanıcı seçilmemişse, komutu yazan kişiyi hedef al
        const hedefKullanici = interaction.options.getUser('kullanıcı') ?? interaction.user;
        
        // Discord Embed (Şekilli ve renkli mesaj) oluşturma
        const embed = new EmbedBuilder()
            .setColor('#2b2d31') // Discord'un kendi koyu gri teması
            .setTitle(`📸 ${hedefKullanici.username} adlı kişinin avatarı`)
            .setImage(hedefKullanici.displayAvatarURL({ dynamic: true, size: 1024 })); // Hareketli pp destekler

        await interaction.reply({ embeds: [embed] });
    },
};
