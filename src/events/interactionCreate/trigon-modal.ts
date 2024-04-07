import { EmbedBuilder, ModalSubmitInteraction, codeBlock } from "discord.js";
import { withCache } from "ultrafetch";
import { getButtons, getInvalidUrlEmbed, getErrorEmbed } from "../../core/utils.js";
import { KeyCacheData, ResponseData } from "../../types";
import { client, Flashcore } from "@roboplay/robo.js";

export default async (interaction: ModalSubmitInteraction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== "TRIGON_MODAL") return;
  const link = interaction.fields.getTextInputValue("TRIGON_LINK");
  await interaction.reply({
    embeds: [new EmbedBuilder().setDescription("Loading...").setColor("Yellow").setTimestamp()],
    ephemeral: true,
    fetchReply: true,
  });

  try {
    if (!/^https:\/\/trigonevo\.com\/getkey\/\?hwid=[^&]{2,}$/.test(link)) {
      const invalidLinkEmbed = getInvalidUrlEmbed(link, "Trigon");

      await interaction.editReply({
        ...invalidLinkEmbed,
      });
      return;
    }

    const start = Date.now();

    const cache = await Flashcore.get<KeyCacheData>(link);
    if (cache) {
      let cacheDate = cache.date;
      if (!(cacheDate instanceof Date)) {
        cacheDate = new Date(cacheDate);
      }

      if (cacheDate.getTime() + 86400000 < Date.now()) {
        await Flashcore.delete(link);
      } else {
        const took = (Date.now() - start) / 1000;
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setURL(link)
              .setTitle("Trigon Bypasser (CACHED)")
              .setFooter({
                text: `HWID: ${new URL(link).searchParams.get("hwid")}`,
              })
              .setThumbnail(client.user?.avatar ? client.user.displayAvatarURL() : null)
              .setColor("White")
              .addFields(
                {
                  name: "<:trigon:1225827147399041025> Trigon Key",
                  value: `${codeBlock(cache.key)}`,
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

    if (data.key) {
      const end = Date.now();
      const ms = end - start;

      const took = ms / 1000;
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setURL(link)
            .setTitle("Trigon Bypasser")
            .setFooter({
              text: `HWID: ${new URL(link).searchParams.get("hwid")}`,
            })
            .setThumbnail(client.user?.avatar ? client.user.displayAvatarURL() : null)
            .setColor("White")
            .addFields(
              {
                name: "<:trigon:1225827147399041025> Trigon Key",
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
      await Flashcore.set(link, { key: data.key, date: Date.now() });
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
