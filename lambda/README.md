## Lambda 

Within this folder is a [python file](fare_api.py). It includes logic of handling requests coming from the UI.

## Building

Building the application via terraform, [../infra/README.md](../infra/README.md) has more information on building this module.

If you want to build individual lambda functions please copy this script into your console in the root of the repo. It individually packages this folder and requirements and pushes to AWS
```
mkdir -p package
cp lambda/*.py package/
pip install --target ./package -r requirements.txt --no-cache-dir
cd package
zip -rq ../lambda.zip . -x "*.pyc" -x "*__pycache__*"
cd ..

aws lambda update-function-code \
  --function-name WMATA-fare-api \
  --zip-file fileb://lambda.zip \
  --region us-east-1
```