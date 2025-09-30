# Mapping-WMATA-Fares
This application helps visualize the confusing fare system of Washington Metropolitan Area Transit Authority (WMATA).

Check it out on [https://wmatafares.com](https://wmatafares.com)

## Prerequisites

* AWS Account and services: S3, Lambda, Glue, and API Gateway
* Optional: Route 53 if you want a domain

## Building the App

5. Set up API Gateway to point to the lambda function then load the gateway url in a browser to see the webapp!


1. Create an [AWS Glue Job](https://aws.amazon.com/glue/)
   - See documentation in [glue/README.md](glue/README.md)
   - Make sure the IAM role has S3 read/write permissions

2. Create a [Lambda Function](https://aws.amazon.com/lambda/)
   - See documentation in [lambda/README.md](lambda/README.md)
   - Set environment variables (S3_BUCKET, S3_PREFIX, WMATA_PARAM_NAME)
   - Install dependencies and package function

3. Build React app
   - See app/README.md
   - Run:
     ```
     npm install
     npm run build
     ```
   - Set REACT_APP_API_BASE_URL in .env to point to API Gateway URL

4. Run deployment workflows locally
   - Install act:
     brew install act   # macOS
     choco install act -y  # Windows
   - Run workflow:
     act -j <job_name>
   - Pass secrets if needed with -s or .env file

5. Set up API Gateway
   - Point to the Lambda function
   - Enable CORS
   - Load API Gateway URL in a browser to view the web app


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
