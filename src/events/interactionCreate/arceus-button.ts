import {
  ActionRowBuilder,
  ButtonInteraction,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export default async (interaction: ButtonInteraction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "BYPASS@ARCEUSX") return;

  const modal = new ModalBuilder()
    .setTitle("Arceus X bypasser")
    .setCustomId("ARCEUSX_MODAL")
    .addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel("Arceus X link")
          .setStyle(TextInputStyle.Short)
          .setCustomId("ARCEUSX_LINK")
          .setPlaceholder("Your Arceus X key link here...")
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(4000)
      )
    );

  await interaction.showModal(modal);
};
