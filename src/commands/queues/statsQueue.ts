import { ChatInputCommandInteraction, MessageFlags } from 'discord.js'
import { drawPlayerMMRStatsCanvas, drawPlayerWinrateStatsCanvas, drawPlayerDeckStakeStatsCanvas, drawCompareStatsCanvas } from '../../utils/canvasHelpers'
import { getQueueIdFromName, getStatsCanvasUserData } from '../../utils/queryDB'
import {
  setupViewStatsButtons,
  setUserQueueRole,
} from '../../utils/queueHelpers'

export default {
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply()

      const mode = interaction.options.getSubcommand()
      const queueName = interaction.options.getString('queue-name', true)
      const byDate = interaction.options.getString('by-date') === 'yes' ? true : false
      const numGames = interaction.options.getNumber('num-games')
      const user1 = interaction.options.getUser('user') || interaction.user
      const queueId = await getQueueIdFromName(queueName)
      const user1Stats = await getStatsCanvasUserData(user1.id, queueId)

      let statFile
      statFile = await drawPlayerMMRStatsCanvas(
        queueName,
        byDate,
        user1Stats,
      )
      
      if (mode == "winrate") {
        statFile = await drawPlayerWinrateStatsCanvas(
          queueName,
          numGames,
          user1Stats,
        )
      } else if (mode == "deckstake") {
        statFile = await drawPlayerDeckStakeStatsCanvas(
          queueName,
          user1Stats,
        )
      } else if (mode == "compare") {
        const user2 = interaction.options.getUser('user2');
        const user3 = interaction.options.getUser('user3');
        const user4 = interaction.options.getUser('user4');

        let user2Stats = await getStatsCanvasUserData(user1.id, queueId)
        let user3Stats = await getStatsCanvasUserData(user1.id, queueId)
        let user4Stats = await getStatsCanvasUserData(user1.id, queueId)

        let numUsers = 2

        if (user2) {let user2Stats = await getStatsCanvasUserData(user2.id, queueId)}
        if (user3) {let user3Stats = await getStatsCanvasUserData(user3.id, queueId); numUsers += 1}
        if (user4) {let user4Stats = await getStatsCanvasUserData(user4.id, queueId); numUsers += 1}
  
        drawCompareStatsCanvas(
          queueName,
          numUsers,
          user1Stats,
          user2Stats,
          user3Stats,
          user4Stats,
        )
      } 



      



      const viewStatsButtons = setupViewStatsButtons(queueName)

      await interaction.editReply({
        files: [statFile],
        components: [viewStatsButtons],
      })

      // Update queue role, just to be sure it's correct when they check
      await setUserQueueRole(queueId, user1.id)
    } catch (err: any) {
      console.error(err)
      const errorMsg = err.detail || err.message || 'Unknown'
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: `Failed to view queue stats. Reason: ${errorMsg}`,
        })
      } else {
        await interaction.reply({
          content: `Failed to view queue stats. Reason: ${errorMsg}`,
          flags: MessageFlags.Ephemeral,
        })
      }
    }
  },
}
