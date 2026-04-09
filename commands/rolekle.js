const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolekle')
        .setDescription('Belirtilen kullanıcıya rol verir.')
        .addUserOption(option => option.setName('kullanıcı').setDescription('Kişi').setRequired(true))
        .addRoleOption(option => option.setName('rol').setDescription('Rol').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const kullanici = interaction.options.getMember('kullanıcı');
        const rol = interaction.options.getRole('rol');
        await kullanici.roles.add(rol);
        await interaction.reply({ content: `${kullanici} kullanıcısına ${rol} rolü verildi.`, ephemeral: true });
    },
};
