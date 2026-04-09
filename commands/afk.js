const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Seni AFK moduna sokar, biri etiketlerse sebebini söyler.')
        .addStringOption(option => 
            option.setName('sebep')
                .setDescription('Neden AFK oluyorsun?')
                .setRequired(true)),
    async execute(interaction) {
        const sebep = interaction.options.getString('sebep');
        const kullaniciId = interaction.user.id;

        // Kullanıcıyı ve sebebini botun hafızasına (afkList) kaydediyoruz
        interaction.client.afkList.set(kullaniciId, sebep);

        await interaction.reply(`Başarıyla AFK moduna geçtin. Biri seni etiketlerse **"${sebep}"** diyeceğim.`);
    },
};
