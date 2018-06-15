// Load the AWS SDK
const aws = require('aws-sdk');
var LINQ = require("node-linq").LINQ;
// Construct the AWS S3 Object - 
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
var s3 = new aws.S3({
    apiVersion: '2006-03-01'
});

// Define 2 new variables for the source and destination buckets
var srcBucket = "/serverless-cicd-lxgzmy";
var destBucket = "lxgzmy-production-pipeline1";
var sourceObject = "";



//Main function
exports.handler = (event, context, callback) => {

    var codepipeline = new aws.CodePipeline();
    console.log(codepipeline);
    console.log(event);
    // Retrieve the Job ID from the Lambda action
    var jobId = event["CodePipeline.job"].id;

    // Retrieve the value of UserParameters from the Lambda action configuration in AWS CodePipeline, in this case a URL which will be
    // health checked by this function.
    var url = event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters;

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
        Bucket: "serverless-cicd-lxgzmy"
    };
    s3.listObjects(params, function (err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
        } else {
            sourceObject = new LINQ(data.Contents)
                .OrderByDescending(function (object) { return object.LastModified; })
                .Select(function (object) { return object.Key; })
                .ToArray()[0];
            console.log(sourceObject);
            s3.copyObject({
                CopySource: srcBucket + '/' + sourceObject,
                Bucket: destBucket,
                ACL: "bucket-owner-full-control",
                Key: "b32630290d2cc76b98b9000e442153a6.zip"
            }, function (copyErr, copyData) {
                if (copyErr) {
                    console.log("Error: " + copyErr);
                } else {
                    putJobSuccess("Tests passed.");
                    console.log('Copied OK');
                    callback(null, 'All done!');
                }
            });

        }
    });
};