const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Belirtilen kullanıcıyı yasaklar.')
        .addUserOption(option => option.setName('kullanıcı').setDescription('Kişi').setRequired(true))
        .addStringOption(option => option.setName('sebep').setDescription('Sebep').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const kullanici = interaction.options.getMember('kullanıcı');
        const sebep = interaction.options.getString('sebep') ?? 'Sebep belirtilmedi.';
        await kullanici.ban({ reason: sebep });
        await interaction.reply({ content: `${kullanici} kullanıcısı yasaklandı. Sebep: ${sebep}` });
    },
};
