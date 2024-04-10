import { EmbedBuilder, ModalSubmitInteraction, codeBlock } from "discord.js";
import { withCache } from "ultrafetch";
import { getButtons, getInvalidUrlEmbed, getErrorEmbed } from "../../core/utils.js";
import { ResponseData } from "../../types";
import { client } from "@roboplay/robo.js";

export default async (interaction: ModalSubmitInteraction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== "DELTA_MODAL") return;

  const link = interaction.fields.getTextInputValue("DELTA_LINK");
  await interaction.reply({
    embeds: [new EmbedBuilder().setDescription("Loading...").setColor("Yellow").setTimestamp()],
    ephemeral: false,
    fetchReply: true,
  });
  try {
    if (!/^https:\/\/gateway\.platoboost\.com\/a\/8\?id=[^&]{2,}/.test(link)) {
      const invalidLinkEmbed = getInvalidUrlEmbed(link, "Delta");

      await interaction.editReply({
        ...invalidLinkEmbed,
      });
      return;
    }

    const enhancedFetch = withCache(fetch);

    const response = await enhancedFetch(`${process.env.API_URL}/bypass?url=${link}`, {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    });

    const data = (await response.json()) as ResponseData;

    if (data.key) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setURL(link)
            .setTitle(`Delta Bypasser${data.cached ? " (CACHED)" : ""}`)
            .setFooter({
              text: `User ID: ${new URL(link).searchParams.get("id")}`,
            })
            .setThumbnail(client.user?.avatar ? client.user.displayAvatarURL() : null)
            .setColor("White")
            .addFields(
              {
                name: "<:delta:1225811720065515601> Delta Key",
                value: `${codeBlock(data.key)}`,
                inline: true,
              },
              {
                name: "<:iOS_stopwatch:1225797873652994219> Response Time",
                value: `${data.took}`,
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
  } catch (error) {
    return await interaction.editReply({
      ...getErrorEmbed(error instanceof Error ? error.message : undefined),
    });
  }
};
