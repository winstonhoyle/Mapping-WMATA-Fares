# Mapping-WMATA-Fares
This application helps visualize the confusing fare system of Washington Metropolitan Area Transit Authority (WMATA).

## Prerequisites

* AWS Account, the services used are S3, [Lambda](https://aws.amazon.com/lambda/), [IAM](https://aws.amazon.com/iam/), and [API Gateway](https://aws.amazon.com/api-gateway/)
   * Optional: [Route 53](https://aws.amazon.com/route53) if you want to use a domain
* [Terraform](https://developer.hashicorp.com/terraform)
* [Python3.12](https://www.python.org/downloads/release/python-3120/)
* [React](https://react.dev/)
* [Node.js](https://nodejs.org/en)
* [A WMATA API Key](https://developer.wmata.com/)

## Building the App

This is a mix of automated CI/CD, Infrastructure as Code ([IaC](https://en.wikipedia.org/wiki/Infrastructure_as_code)), and manual python due to [AWS Free Tier limits](https://aws.amazon.com/free/). 

1. **Create IAM users & roles, a Lambda function, an API Gateway and an S3 bucket**

   a. [Authenticate aws-cli credentials](https://docs.aws.amazon.com/cli/latest/reference/configure/)
   ```
   cd infra
   terraform plan
   ```

   b. Ensure you want these services and users/roles to be created
   ```
   terraform apply
   ```

2. **Populate the bucket, I wanted this to be within an AWS Glue Job but the free tier limit does not allow the type of Glue job needed for [IoC](https://en.wikipedia.org/wiki/Infrastructure_as_code)**

   a. Using the [env.sample](env.sample), populate `WMATA_API_KEY` from the [WMATA API site](https://developer.wmata.com/).
   ```
   WMATA_API_KEY=""
   S3_BUCKET="wmata-fares"
   S3_PREFIX="data/"
   ```

   b. Create a virtual env
   ```
   python3.12 -m venv .venv
   source .venv/bin/activate
   ```

   c. Install requirements.txt
   ```
   python3.12 -m pip install -r requirements.txt
   ```

   d. Run [data/upload_files.py](data/upload_files.py)
   ```
   python3.12 data/upload_files.py
   ```

   e. Locally you'll see 3 small JSON files, one lines, one stations, one fares. On your [S3 Bucket](https://aws.amazon.com/s3/) you'll see all 3 within `s3://wmata-fares/data/`

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
