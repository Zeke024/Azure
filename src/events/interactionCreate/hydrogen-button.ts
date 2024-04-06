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
  if (interaction.customId !== "BYPASS@HYDROGEN") return;

  const modal = new ModalBuilder()
    .setTitle("Hydrogen bypasser")
    .setCustomId("HYDROGEN_MODAL")
    .addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel("Hydrogen link")
          .setStyle(TextInputStyle.Short)
          .setCustomId("HYDROGEN_LINK")
          .setPlaceholder("Your Hydrogen key link here...")
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(4000)
      )
    );

  await interaction.showModal(modal);
};
