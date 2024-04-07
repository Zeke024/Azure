import { EmbedBuilder, ModalSubmitInteraction, codeBlock } from "discord.js";
import { withCache } from "ultrafetch";
import { getButtons, getInvalidUrlEmbed, getErrorEmbed } from "../../core/utils.js";
import {
  // KeyCacheData,
  ResponseData,
} from "../../types";
import {
  client,
  // Flashcore
} from "@roboplay/robo.js";

export default async (interaction: ModalSubmitInteraction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== "DELTA_MODAL") return;
  // const start = Date.now();

  const link = interaction.fields.getTextInputValue("DELTA_LINK");
  await interaction.reply({
    embeds: [new EmbedBuilder().setDescription("Loading...").setColor("Yellow").setTimestamp()],
    ephemeral: true,
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

    // Delta bypasser is already instant; no need to cache it.

    /*const cache = await Flashcore.get<KeyCacheData>(link);
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
              .setTitle("Delta Bypasser (CACHED)")
              .setFooter({
                text: `User ID: ${new URL(link).searchParams.get("id")}`,
              })
              .setThumbnail(client.user?.avatar ? client.user.displayAvatarURL() : null)
              .setColor("White")
              .addFields(
                {
                  name: "<:delta:1225811720065515601> Delta Key",
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
    }*/

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
            .setTitle("Delta Bypasser")
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
                value: `${data.took.toString().replaceAll("s", " seconds")}`,
                inline: true,
              }
            ),
        ],
        components: getButtons().components,
      });
      // await Flashcore.set(link, { key: data.key, date: Date.now() });
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
