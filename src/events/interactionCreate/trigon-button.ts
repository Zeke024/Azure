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
  if (interaction.customId !== "BYPASS@TRIGON") return;

  const modal = new ModalBuilder()
    .setTitle("Trigon bypasser")
    .setCustomId("TRIGON_MODAL")
    .addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel("Trigon link")
          .setStyle(TextInputStyle.Short)
          .setCustomId("TRIGON_LINK")
          .setPlaceholder("Your Trigon key link here...")
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(4000)
      )
    );

  await interaction.showModal(modal);
};
