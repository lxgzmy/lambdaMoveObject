rm output.zip
zip -r -q output.zip ./*
aws lambda update-function-code --function-name CrossAccountCopyForBuildArtifact --zip-file fileb://output.zip --profile crdev