const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('zarat')
        .setDescription('1 ile 6 arasında rastgele bir zar atar.'),
    async execute(interaction) {
        // 1 ile 6 arasında rastgele sayı üretir
        const zar = Math.floor(Math.random() * 6) + 1;
        
        await interaction.reply(`🎲 Zar atılıyor... Ve **${zar}** geldi!`);
    },
};
