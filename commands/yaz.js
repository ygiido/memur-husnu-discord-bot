const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yaz')
        .setDescription('Bota istediğiniz mesajı yazdırır.')
        .addStringOption(option => 
            option.setName('mesaj')
                .setDescription('Botun yazmasını istediğiniz mesaj')
                .setRequired(true)),
    async execute(interaction) {
        const mesaj = interaction.options.getString('mesaj');
        await interaction.channel.send(mesaj);
        await interaction.reply({ content: 'Mesaj gönderildi!', ephemeral: true });
    },
};
