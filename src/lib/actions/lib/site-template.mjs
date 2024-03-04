import yaml from 'js-yaml'

const SiteTemplate = class {
  constructor ({ accountID, apexDomain, bucketName, certificateArn, region, sourceType }) {
    this.accountID = accountID
    this.apexDomain = apexDomain
    this.bucketName = bucketName
    this.certificateArn = certificateArn
    this.region = region
    this.sourceType = sourceType
  }

  get baseTemplate () {
    return {
      Resources : {
        SiteS3Bucket : {
          Type       : 'AWS::S3::Bucket',
          Properties : {
            AccessControl : 'Private',
            BucketName    : this.bucketName
          }
        },
        SiteCloudFrontOriginAccessControl : {
          Type       : 'AWS::CloudFront::OriginAccessControl',
          Properties : {
            OriginAccessControlConfig : {
              Description                   : 'Origin Access Control (OAC) allowing CloudFront Distribution to access site S3 bucket.',
              Name                          : `${this.bucketName}-OAC`,
              OriginAccessControlOriginType : 's3',
              SigningBehavior               : 'always',
              SigningProtocol               : 'sigv4'
            }
          }
        },
        SiteCloudFrontDistribution : {
          Type       : 'AWS::CloudFront::Distribution',
          DependsOn  : ['SiteS3Bucket'],
          Properties : {
            DistributionConfig : {
              Origins : [
                {
                  DomainName     : `${this.bucketName}.s3.${this.region}.amazonaws.com`,
                  Id             : 'static-hosting',
                  S3OriginConfig : {
                    OriginAccessIdentity : ''
                  },
                  OriginAccessControlId : '!GetAtt SiteCloudFrontOriginAccessControl.Id'
                }
              ],
              Enabled              : true,
              DefaultRootObject    : 'index.html',
              CustomErrorResponses : [
                { ErrorCode : 403, ResponseCode : 200, ResponsePagePath : '/index.html' },
                { ErrorCode : 404, ResponseCode : 200, ResponsePagePath : '/index.html' }
              ],
              HttpVersion       : 'http2',
              Aliases           : [this.apexDomain, `www.${this.apexDomain}`],
              ViewerCertificate : {
                AcmCertificateArn      : this.certificateArn,
                MinimumProtocolVersion : 'TLSv1.2_2021',
                SslSupportMethod       : 'sni-only'
              },
              DefaultCacheBehavior : {
                AllowedMethods       : ['GET', 'HEAD'],
                CachePolicyId        : '658327ea-f89d-4fab-a63d-7e88639e58f6', // CachingOptimized cache policy ID
                Compress             : true,
                TargetOriginId       : 'static-hosting',
                ViewerProtocolPolicy : 'redirect-to-https'
              }
            }
          }
        }, // SiteCloudFrontDistribution
        SiteBucketPolicy : {
          Type       : 'AWS::S3::BucketPolicy',
          DependsOn  : ['SiteS3Bucket', 'SiteCloudFrontDistribution'],
          Properties : {
            Bucket         : this.bucketName,
            PolicyDocument : {
              Version   : '2012-10-17',
              Statement : [
                {
                  Effect    : 'Allow',
                  Principal : {
                    Service : 'cloudfront.amazonaws.com'
                  },
                  Action    : 's3:GetObject',
                  Resource  : `arn:aws:s3:::${this.bucketName}/*`,
                  Condition : {
                    StringEquals : {
                      'AWS:SourceArn' : `!Join ['', [ 'arn:aws:cloudfront::${this.accountID}:distribution/', !GetAtt SiteCloudFrontDistribution.Id ]]`
                    }
                  }
                }
              ]
            }
          }
        }
      }, // Resources
      Outputs : {
        SiteS3Bucket : {
          Value : { Ref : 'SiteS3Bucket' }
        },
        SiteCloudFrontOriginAccessControl : {
          Value : { Ref : 'SiteCloudFrontOriginAccessControl' }
        },
        SiteCloudFrontDistribution : {
          Value : { Ref : 'SiteCloudFrontDistribution' }
        }
      }
    }
  }

  render () {
    let output = `AWSTemplateFormatVersion: 2010-09-09
Description: Static ${this.apexDomain} site using an S3 bucket and CloudFront.

`
    output += yaml.dump(this.baseTemplate, { lineWidth : -1 })
      // yaml wants to quote the template functions like '!Get', but that breaks our template
      .replaceAll(/: '(!.+)'\s*$/gm, ': $1')
      .replaceAll(/(?<!: )''/gm, "'") // When quoting the above, yaml generates escaped 's

    return output
  }
}

export { SiteTemplate }
