import { join as pathJoin } from 'node:path'
import { createReadStream } from 'node:fs'

import { CreateBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { CONTACT_EMAILER_ZIP_NAME, CONTACT_HANDLER_ZIP_NAME, REQUEST_SIGNER_ZIP_NAME } from './constants'
import { convertDomainToBucketName } from '../../../shared/convert-domain-to-bucket-name'
import { determineBucketName } from '../../../shared/determine-bucket-name'
// jsdoc wants this, but it causes a circular dependency
// import { SiteTemplate } from '../../../shared/site-template'

/* eslint-disable  jsdoc/no-undefined-types */ // See note above re. SiteTemplate
/**
 * Stages the zipped Lambda function packages on a common S3 bucket.
 * @param {object} input - Destructured input argument.
 * @param {boolean} input.enableEmail - True if the site is to be built with email on contact form submission support.
 * @param {object} input.siteInfo - See {@link SiteTemplate} for details.
 * @returns {string} The Lambda function bucket name.
 */ /* eslint-enable  jsdoc/no-undefined-types */
const stageLambdaFunctionZipFiles = async ({ credentials, enableEmail, siteInfo }) => {
  process.stdout.write('Staging Lambda function zip files...\n')

  const { apexDomain, region } = siteInfo

  const s3Client = new S3Client({ credentials, region })

  let lambdaFunctionsBucketName = convertDomainToBucketName(apexDomain) + '-lambda-functions'
  lambdaFunctionsBucketName =
    await determineBucketName({
      bucketName : lambdaFunctionsBucketName,
      credentials,
      findName   : true,
      s3Client,
      siteInfo
    })

  const createBucketCommand = new CreateBucketCommand({
    ACL    : 'private',
    Bucket : lambdaFunctionsBucketName
  })
  await s3Client.send(createBucketCommand)

  const putCommands = [
    putZipFile({ bucketName : lambdaFunctionsBucketName, fileName : CONTACT_HANDLER_ZIP_NAME, s3Client }),
    putZipFile({ bucketName : lambdaFunctionsBucketName, fileName : REQUEST_SIGNER_ZIP_NAME, s3Client })
  ]

  if (enableEmail === true) {
    putCommands.push(putZipFile({
      bucketName : lambdaFunctionsBucketName,
      fileName   : CONTACT_EMAILER_ZIP_NAME,
      s3Client
    }))
  }

  await Promise.all(putCommands)

  return lambdaFunctionsBucketName
}

const putZipFile = async ({ bucketName, fileName, s3Client }) => {
  // when built, everything sits in './dist' together
  const zipPath = pathJoin(__dirname, fileName)
  const readStream = createReadStream(zipPath)

  const putObjectCommand = new PutObjectCommand({
    Body        : readStream,
    Bucket      : bucketName,
    Key         : fileName,
    ContentType : 'application/zip'
  })

  await s3Client.send(putObjectCommand)
}

export { stageLambdaFunctionZipFiles }