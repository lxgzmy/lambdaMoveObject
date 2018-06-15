rm output.zip
zip -r -q output.zip ./*
aws lambda update-function-code --function-name copyDeploymentcodeToProductionS3 --zip-file fileb://output.zip