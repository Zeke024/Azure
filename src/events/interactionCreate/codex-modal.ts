import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { withCache } from "ultrafetch";
import {
  getButtons,
  getInvalidUrlEmbed,
  getErrorEmbed,
} from "../../core/utils.js";
import { ResponseData } from "../../types";
import { client } from "@roboplay/robo.js";

export default async (interaction: ModalSubmitInteraction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== "CODEX_MODAL") return;
  const link = interaction.fields.getTextInputValue("CODEX_LINK");
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription("Loading...")
        .setColor("Yellow")
        .setTimestamp(),
    ],
    ephemeral: true,
    fetchReply: true,
  });

  if (!link.startsWith("https://mobile.codex.lol")) {
    const invalidLinkEmbed = getInvalidUrlEmbed(link, "Codex");

    await interaction.editReply({
      ...invalidLinkEmbed,
    });
    return;
  }

  const enhancedFetch = withCache(fetch);
  const start = Date.now();
  const response = await enhancedFetch(
    `${process.env.API_URL}/bypass?url=${link}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    }
  );

  const data = (await response.json()) as ResponseData;

  if (data.success) {
    const end = Date.now();
    const took = end - start;
    const fixed = `${(took / 1000).toFixed(2)} seconds`;
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setURL(link)
          .setTitle("Codex Bypasser")
          .setThumbnail(
            client.user?.avatar ? client.user.displayAvatarURL() : null
          )
          .setColor("White")
          .addFields(
            {
              name: "<:codex:1225819184982654986> Codex Response",
              value: `Key System completed!`,
              inline: true,
            },
            {
              name: "<:iOS_stopwatch:1225797873652994219> Response Time",
              value: `${fixed}`,
              inline: true,
            }
          ),
      ],
      components: getButtons().components,
    });
    return;
  } else {
    return await interaction.editReply({
      ...getErrorEmbed(data.error || undefined),
    });
  }
};
