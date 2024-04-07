import { EmbedBuilder, ModalSubmitInteraction, codeBlock } from "discord.js";
import { withCache } from "ultrafetch";
import { getButtons, getInvalidUrlEmbed, getErrorEmbed } from "../../core/utils.js";
import { ResponseData } from "../../types";
import { client } from "@roboplay/robo.js";

export default async (interaction: ModalSubmitInteraction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== "VEGAX_MODAL") return;
  const link = interaction.fields.getTextInputValue("VEGAX_LINK");
  await interaction.reply({
    embeds: [new EmbedBuilder().setDescription("Loading...").setColor("Yellow").setTimestamp()],
    ephemeral: true,
    fetchReply: true,
  });

  try {
    if (!/^https:\/\/pandadevelopment\.net\/getkey\?service=vegax&hwid=[^&]{2,}(&provider=linkvertise)?$/.test(link)) {
      const invalidLinkEmbed = getInvalidUrlEmbed(link, "Vega X");

      await interaction.editReply({
        ...invalidLinkEmbed,
      });
      return;
    }

    const hwid = new URL(link).searchParams.get("hwid");

    const enhancedFetch = withCache(fetch);
    const start = Date.now();

    const response = await enhancedFetch(`${process.env.API_URL}/bypass?hwid=${hwid}`, {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    });

    const data = (await response.json()) as ResponseData;

    if (data.key) {
      const end = Date.now();
      const ms = end - start;

      const took = ms / 1000;
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setURL(link)
            .setTitle("Vega X Bypasser")
            .setFooter({
              text: `HWID: ${hwid}`,
            })
            .setThumbnail(client.user?.avatar ? client.user.displayAvatarURL() : null)
            .setColor("White")
            .addFields(
              {
                name: "<:vegax:1225824245276475443> Vega X Key",
                value: `${codeBlock(data.key)}`,
                inline: true,
              },
              {
                name: "<:iOS_stopwatch:1225797873652994219> Response Time",
                value: `${took.toFixed(2)} seconds`,
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
