const Discord = require('discord.js')
const { Carrinho } = require('../models/schemas');
const { gerarEmbedCarrinhoDetalhes } = require('./generateEmbed');
const config = require("../../config.json");
const { QuickDB } = require('quick.db');
const db = new QuickDB();

/** @param {Discord.ButtonInteraction} interaction */
const criarCarrinho = async (categoriaCarrinho, interaction) => {

    const filtroCarrinho = {
        user_id: interaction.user.id,
        server_id: interaction.guildId,
    };

    const categoria = await db.get(`category_id${config.owner}`)

    const carrinhoCanal = await interaction.guild.channels.create(`🛒・carrinho-${interaction.user.username}`, {
        parent: categoria,
        topic: interaction.user.id,
        permissionOverwrites: [
            {
                id: interaction.guildId,
                deny: ['VIEW_CHANNEL'],
            },
            {
                id: interaction.user.id,
                allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
                deny: ['SEND_MESSAGES']
            },
        ],
    })

    const msgCarrinhoStatus = await carrinhoCanal.send({
        content: `${interaction.user}`,
        embeds: [gerarEmbedCarrinhoDetalhes(null, interaction)],
        components: [
            new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setLabel('Finalizar compras')
                        .setEmoji('🛒')
                        .setStyle('SUCCESS')
                        .setCustomId('finalizar-compra'),

                    new Discord.MessageButton()
                        .setLabel('Cancelar compras')
                        .setEmoji('🗑️')
                        .setStyle('DANGER')
                        .setCustomId('cancelar-compra'),

                    new Discord.MessageButton()
                        .setLabel('Adicionar cupom')
                        .setEmoji('🏷️')
                        .setStyle('SECONDARY')
                        .setCustomId('utilizar-cupom'),
                )
        ]
    });

    await Carrinho.updateOne({
        ...filtroCarrinho
    }, {
        ...filtroCarrinho,
        msg_carrinho_status: msgCarrinhoStatus.id,
        produtos: []
    }, {
        upsert: true
    });

    return carrinhoCanal;
};

module.exports = { criarCarrinho };
