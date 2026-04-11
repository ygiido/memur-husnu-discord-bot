const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duyur')
        .setDescription('Belirtilen kanala everyone etiketiyle duyuru yapar.')
        .addChannelOption(option => option.setName('kanal').setDescription('Kanal').setRequired(true))
        .addStringOption(option => option.setName('mesaj').setDescription('Mesaj').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const kanal = interaction.options.getChannel('kanal');
        const mesaj = interaction.options.getString('mesaj');
        await kanal.send(`@here\n\n**Duyuru** ${mesaj}`);
        await interaction.reply({ content: 'Duyuru gönderildi.', ephemeral: true });
    },
};
