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
  if (interaction.customId !== "BYPASS@VEGAX") return;

  const modal = new ModalBuilder()
    .setTitle("Vega X bypasser")
    .setCustomId("VEGAX_MODAL")
    .addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel("Vega X link")
          .setStyle(TextInputStyle.Short)
          .setCustomId("VEGAX_LINK")
          .setPlaceholder("Your Vega X key link here...")
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(4000)
      )
    );

  await interaction.showModal(modal);
};
