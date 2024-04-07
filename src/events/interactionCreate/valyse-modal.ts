import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { withCache } from "ultrafetch";
import { getButtons, getInvalidUrlEmbed, getErrorEmbed } from "../../core/utils.js";
import { ResponseData, WhitelistCacheData } from "../../types";
import { client, Flashcore } from "@roboplay/robo.js";

export default async (interaction: ModalSubmitInteraction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== "VALYSE_MODAL") return;
  const link = interaction.fields.getTextInputValue("VALYSE_LINK");
  await interaction.reply({
    embeds: [new EmbedBuilder().setDescription("Loading...").setColor("Yellow").setTimestamp()],
    ephemeral: true,
    fetchReply: true,
  });

  try {
    if (!/^https:\/\/valyse\.best\/verification\?device_id=[^&]{2,}/.test(link)) {
      const invalidLinkEmbed = getInvalidUrlEmbed(link, "Valyse");

      await interaction.editReply({
        ...invalidLinkEmbed,
      });
      return;
    }

    const start = Date.now();

    const cache = await Flashcore.get<WhitelistCacheData>(link);
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
              .setTitle("Valyse Bypasser (CACHED)")
              .setFooter({
                text: `Device ID: ${new URL(link).searchParams.get("device_id")}`,
              })
              .setThumbnail(client.user?.avatar ? client.user.displayAvatarURL() : null)
              .setColor("White")
              .addFields(
                {
                  name: "<:valyse:1225828915709350022> Valyse Response",
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
      const end = Date.now();
      const ms = end - start;

      const took = ms / 1000;
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setURL(link)
            .setTitle("Valyse Bypasser")
            .setFooter({
              text: `Device ID: ${new URL(link).searchParams.get("device_id")}`,
            })
            .setThumbnail(client.user?.avatar ? client.user.displayAvatarURL() : null)
            .setColor("White")
            .addFields(
              {
                name: "<:valyse:1225828915709350022> Valyse Response",
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
