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
  if (interaction.customId !== "BYPASS@VALYSE") return;

  const modal = new ModalBuilder()
    .setTitle("Valyse bypasser")
    .setCustomId("VALYSE_MODAL")
    .addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel("Valyse link")
          .setStyle(TextInputStyle.Short)
          .setCustomId("VALYSE_LINK")
          .setPlaceholder("Your Valyse key link here...")
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(4000)
      )
    );

  await interaction.showModal(modal);
};
