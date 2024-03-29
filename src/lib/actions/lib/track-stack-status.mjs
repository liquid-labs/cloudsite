import { DeleteStackCommand, DescribeStacksCommand } from '@aws-sdk/client-cloudformation'

import { progressLogger } from '../../shared/progress-logger'

const RECHECK_WAIT_TIME = 2000 // ms

const trackStackStatus = async ({ cloudFormationClient, noDeleteOnFailure, noInitialStatus, stackName }) => {
  let stackStatus, previousStatus
  do {
    const describeInput = { StackName : stackName }
    const describeCommand = new DescribeStacksCommand(describeInput)
    const describeResponse = await cloudFormationClient.send(describeCommand)

    stackStatus = describeResponse.Stacks[0].StackStatus

    if (stackStatus !== previousStatus && (noInitialStatus !== true || previousStatus !== undefined)) {
      // convert to sentence case
      const statusMessage = stackStatus.charAt(0) + stackStatus.slice(1).toLowerCase().replaceAll(/_/g, ' ')
      progressLogger.write((previousStatus !== undefined ? '\n' : '') + statusMessage)
      if (!stackStatus.endsWith('_PROGRESS')) {
        progressLogger.write('\n')
      }
    } else {
      progressLogger.write('.')
    }

    previousStatus = stackStatus
    await new Promise(resolve => setTimeout(resolve, RECHECK_WAIT_TIME))
  } while (stackStatus.endsWith('_IN_PROGRESS'))

  if (stackStatus === 'ROLLBACK_COMPLETE' && noDeleteOnFailure !== true) {
    progressLogger.write(`\nDeleting stack '${stackName}' `)
    const deleteInput = { StackName : stackName }
    const deleteCommand = new DeleteStackCommand(deleteInput)
    await cloudFormationClient.send(deleteCommand)

    trackStackStatus({ cloudFormationClient, noDeleteOnFailure : true, noInitialStatus : true, stackName })
  }

  return stackStatus
}

export { trackStackStatus }
