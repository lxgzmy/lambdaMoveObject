// Load the AWS SDK
const aws = require('aws-sdk');
var LINQ = require("node-linq").LINQ;
// Construct the AWS S3 Object - 
http: //docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
    var s3 = new aws.S3({
        apiVersion: '2006-03-01'
    });

// Define 2 new variables for the source and destination buckets
var destBucket = process.env.Dest_S3_Bucket; //"cashrewards.serverless.build.artifact.production";


//Main function
exports.handler = (event, context, callback) => {

    var codepipeline = new aws.CodePipeline();
    console.log(codepipeline);
    console.log(event);

    // Retrieve the Job ID from the Lambda action
    var jobId = event["CodePipeline.job"].id;
    // Retrieve the value of UserParameters from the Lambda action configuration in AWS CodePipeline, in this case a URL which will be
    var outputKey = event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters;
    // health checked by this function.
    var inputObject = event["CodePipeline.job"].data.inputArtifacts[0];

    // Notify AWS CodePipeline of a successful job
    var putJobSuccess = function (message) {
        var params = {
            jobId: jobId
        };
        codepipeline.putJobSuccessResult(params, function (err, data) {
            if (err) {
                context.fail(err);
            } else {
                context.succeed(message);
            }
        });
    };

    //Copy the current object to the destination bucket
    var params = {
        CopySource: inputObject.location.s3Location.bucketName + '/' + inputObject.location.s3Location.objectKey,
        Bucket: destBucket,
        ACL: "bucket-owner-full-control",
        Key: outputKey
    };
    s3.copyObject(params, function (copyErr, copyData) {
        if (copyErr) {
            console.log("Error: " + copyErr);
        } else {

            //don't forget to call put job success for pipeline
            //otherwise the pipleline will fail.
            putJobSuccess("Tests passed.");

            console.log('Copied OK');
            callback(null, 'All done!');
        }
    });
};