// credit to :
// https://github.com/aws-samples/aws-lambda-function-url-secured/blob/209bc9d2a73dbb6eefed1dc9cf98a9678ede9873/src/functions/auth/auth.mjs
// By AWS original licensed under MIT license

import { SignatureV4 } from '@aws-sdk/signature-v4'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { HttpRequest } from '@aws-sdk/protocol-http'
import { createHash, createHmac } from 'node:crypto'

function Sha256 (secret) {
  return secret ? createHmac('sha256', secret) : createHash('sha256')
}

const credentialProvider = fromNodeProviderChain()
const credentials = await credentialProvider()

export const handler = async (event) => {
  const request = event.Records[0].cf.request

  const headers = request.headers

  // remove the x-forwarded-for from the signature
  delete headers['x-forwarded-for']

  if (!Object.prototype.hasOwnProperty.call(request.origin, 'custom')) {
    throw new Error("Unexpected origin type. Expected 'custom'. Got: " + JSON.stringify(request.origin))
  }

  // remove the "behaviour" path from the uri to send to Lambda
  // ex: /updateBook/1234 => /1234
  let uri = request.uri.substring(1)
  const urisplit = uri.split('/')
  urisplit.shift() // remove the first part (getBooks, createBook, ...)
  uri = '/' + urisplit.join('/')
  request.uri = uri

  const hostname = request.headers.host[0].value
  const region = hostname.split('.')[2]
  const path = uri + (request.querystring ? '?' + request.querystring : '')

  // build the request to sign
  const req = new HttpRequest({
    hostname,
    path,
    body   : (request.body && request.body.data) ? Buffer.from(request.body.data, request.body.encoding) : undefined,
    method : request.method
  })
  for (const header of Object.values(headers)) {
    req.headers[header[0].key] = header[0].value
  }
  console.debug(JSON.stringify(req))

  // sign the request with Signature V4 and the credentials of the edge function itself
  // the edge function must have lambda:InvokeFunctionUrl permission for the target URL
  const signer = new SignatureV4({
    credentials,
    region,
    service : 'lambda',
    sha256  : Sha256
  })

  const signedRequest = await signer.sign(req)
  console.debug(JSON.stringify(signedRequest))

  // reformat the headers for CloudFront
  for (const header in signedRequest.headers) {
    request.headers[header.toLowerCase()] = [{
      key   : header,
      value : signedRequest.headers[header].toString()
    }]
  }
  console.info('signed request=' + JSON.stringify(request))
  return request
}
