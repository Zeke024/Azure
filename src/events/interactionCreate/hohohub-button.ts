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
  if (interaction.customId !== "BYPASS@HOHOHUB") return;

  const modal = new ModalBuilder()
    .setTitle("Hohohub bypasser")
    .setCustomId("HOHOHUB_MODAL")
    .addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel("Hohohub link")
          .setStyle(TextInputStyle.Short)
          .setCustomId("HOHOHUB_LINK")
          .setPlaceholder("Your Hohohub key link here...")
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(4000)
      )
    );

  await interaction.showModal(modal);
};
