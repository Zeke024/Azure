import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { withCache } from "ultrafetch";
import { getButtons, getInvalidUrlEmbed, getErrorEmbed } from "../../core/utils.js";
import { ResponseData, WhitelistCacheData } from "../../types";
import { client, Flashcore } from "@roboplay/robo.js";

export default async (interaction: ModalSubmitInteraction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== "ARCEUSX_MODAL") return;
  const link = interaction.fields.getTextInputValue("ARCEUSX_LINK");
  const now = Date.now();
  await interaction.reply({
    embeds: [new EmbedBuilder().setDescription("Loading...").setColor("Yellow").setTimestamp()],
    ephemeral: true,
    fetchReply: true,
  });

  try {
    if (!/^https:\/\/spdmteam\.com\/key-system-1\?hwid=[^&]{2,}/.test(link)) {
      const invalidLinkEmbed = getInvalidUrlEmbed(link, "Arceus X");

      await interaction.editReply({
        ...invalidLinkEmbed,
      });
      return;
    }

    const cache = await Flashcore.get<WhitelistCacheData>(link);
    if (cache) {
      let cacheDate = cache.date;
      if (!(cacheDate instanceof Date)) {
        cacheDate = new Date(cacheDate);
      }

      if (cacheDate.getTime() + 86400000 < Date.now()) {
        await Flashcore.delete(link);
      } else {
        const took = (Date.now() - now) / 1000;
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setURL(link)
              .setTitle("Arceus X Bypasser (CACHED)")
              .setFooter({
                text: `HWID: ${new URL(link).searchParams.get("hwid")}`,
              })
              .setThumbnail(client.user?.avatar ? client.user.displayAvatarURL() : null)
              .setColor("White")
              .addFields(
                {
                  name: "<:arceus:1225781919225090080> Arceus X Response",
                  value: `Key System completed!`,
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
      }
    }

    const enhancedFetch = withCache(fetch);
    const response = await enhancedFetch(`${process.env.API_URL}/bypass?url=${link}`, {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    });

    const data = (await response.json()) as ResponseData;

    if (data.success) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setURL(link)
            .setTitle("Arceus X Bypasser")
            .setFooter({
              text: `HWID: ${new URL(link).searchParams.get("hwid")}`,
            })
            .setThumbnail(client.user?.avatar ? client.user.displayAvatarURL() : null)
            .setColor("White")
            .addFields(
              {
                name: "<:arceus:1225781919225090080> Arceus X Response",
                value: `Key System completed!`,
                inline: true,
              },
              {
                name: "<:iOS_stopwatch:1225797873652994219> Response Time",
                value: `${data.took.toString().replaceAll("s", " seconds")}`,
                inline: true,
              }
            ),
        ],
        components: getButtons().components,
      });
      await Flashcore.set<WhitelistCacheData>(link, { date: new Date(), whitelisted: true });
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
