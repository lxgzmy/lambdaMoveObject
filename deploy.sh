rm output.zip
zip -r -q output.zip ./*
aws lambda update-function-code --function-name CrossAccountCopyForBuildArtifact --zip-file fileb://output.zip environment Variables="{Dest_S3_Bucket=cashrewards.serverless.build.artifact.production}" --profile crdev