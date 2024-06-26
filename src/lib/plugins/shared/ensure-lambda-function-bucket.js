import { CreateBucketCommand, PutBucketTaggingCommand } from '@aws-sdk/client-s3'

import { determineBucketName } from '../../shared/determine-bucket-name'
import { getResourceTags } from '../../shared/get-resource-tags'
import { progressLogger } from '../../shared/progress-logger'

const ensureLambdaFunctionBucket = async ({ credentials, s3Client, siteInfo }) => {
  progressLogger.write('Checking for lambda function bucket... ')

  let { lambdaFunctionsBucket } = siteInfo

  if (lambdaFunctionsBucket === undefined) {
    progressLogger.write('CREATING\n')
    lambdaFunctionsBucket =
      await determineBucketName({
        credentials,
        findName : true,
        s3Client,
        siteInfo
      })

    progressLogger.write(`Determined name '${lambdaFunctionsBucket}'\n`)

    const createBucketCommand = new CreateBucketCommand({
      ACL    : 'private',
      Bucket : lambdaFunctionsBucket
    })
    await s3Client.send(createBucketCommand)
    progressLogger.write('Created.\n')
  } else {
    progressLogger.write(`FOUND ${lambdaFunctionsBucket}\n`)
  }

  const putBucketTaggingCommand = new PutBucketTaggingCommand({
    Bucket  : lambdaFunctionsBucket,
    Tagging : {
      TagSet : getResourceTags({ funcDesc : 'lambda code storage', siteInfo })
    }
  })
  await s3Client.send(putBucketTaggingCommand)

  siteInfo.lambdaFunctionsBucket = lambdaFunctionsBucket

  return lambdaFunctionsBucket
}

export { ensureLambdaFunctionBucket }
