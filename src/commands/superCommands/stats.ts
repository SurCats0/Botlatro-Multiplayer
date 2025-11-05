import viewStats from '../queues/statsQueue'
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js'
import { group } from 'node:console'
import { getQueueNames } from 'utils/queryDB'

export default {
  data: new SlashCommandBuilder()
    .setName('stats')
  .setDescription('View stats')
  .addSubcommandGroup(group =>
    group
      .setName('mode')
      .setDescription('Select Stats Mode')
      .addSubcommand(sub =>
        sub
          .setName('mmr')
          .setDescription('View MMR stats')
          .addStringOption(option =>
            option
              .setName('queue-name')
              .setDescription('The queue name to view stats for')
              .setRequired(true)
              .setAutocomplete(true)
          )
          .addUserOption(option =>
            option
              .setName('user')
              .setDescription('The user to view stats for (defaults to yourself)')
          )
          .addStringOption(option =>
            option
              .setName('by-date')
              .setDescription('Sort stats by date')
              .addChoices({ name: 'yes', value: 'yes' })
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('winrate')
          .setDescription('View Winrate stats')
          .addStringOption(option =>
            option
              .setName('queue-name')
              .setDescription('The queue name to view stats for')
              .setRequired(true)
              .setAutocomplete(true)
          )
          .addUserOption(option =>
            option
              .setName('user')
              .setDescription('The user to view stats for (defaults to yourself)')
          )
          .addNumberOption(option =>
            option
              .setName('num-games')
              .setDescription('Number of games to sample')
              .addChoices({ name: '30', value: 30 },{ name: '20', value: 20 },{ name: '10', value: 10 })
              .setRequired(false)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('deckstake')
          .setDescription('View deck and stake stats')
          .addStringOption(option =>
            option
              .setName('queue-name')
              .setDescription('The queue name to view stats for')
              .setRequired(true)
              .setAutocomplete(true)
          )
          .addUserOption(option =>
            option
              .setName('user')
              .setDescription('The user to view stats for (defaults to yourself)')
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('compare')
          .setDescription('Compare up to 4 users')
          .addStringOption(option =>
            option
              .setName('queue-name')
              .setDescription('The queue name to view stats for')
              .setRequired(true)
              .setAutocomplete(true)
          )
          .addUserOption(option =>
            option
              .setName('user')
              .setDescription('The user to compare')
              .setRequired(true)
          )
          .addUserOption(option =>
            option
              .setName('user2')
              .setDescription('The user to compare')
              .setRequired(true)
          )
          .addUserOption(option =>
            option
              .setName('user3')
              .setDescription('The user to compare')
          )
          .addUserOption(option =>
            option
              .setName('user4')
              .setDescription('The user to compare')
          )
      )
  ),




  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.options.getSubcommand() === 'mmr') {
      await viewStats.execute(interaction)
    }
    if (interaction.options.getSubcommand() === 'winrate') {
      await viewStats.execute(interaction)
    }
    if (interaction.options.getSubcommand() === 'deckstake') {
      await viewStats.execute(interaction)
    }
    if (interaction.options.getSubcommand() === 'compare') {
      await viewStats.execute(interaction)
    }
  },
  async autocomplete(interaction: AutocompleteInteraction) {
    const currentValue = interaction.options.getFocused()
    const queueNames = await getQueueNames()
    const filteredQueueNames = queueNames.filter((name) =>
      name.toLowerCase().includes(currentValue.toLowerCase()),
    )
    await interaction.respond(
      filteredQueueNames.map((name) => ({ name, value: name })).slice(0, 25),
    )
  },
}
// this supercommand should only be usable by everyone+
