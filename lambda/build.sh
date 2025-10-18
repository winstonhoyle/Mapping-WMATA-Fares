rm -rf lambda/build
mkdir lambda/build
pip install --upgrade pip
pip install -r lambda/requirements.txt -t lambda/build
cp lambda/fare_api.py lambda/build
cd lambda/build
zip -r9 ../lambda_package.zip .
cd ../..