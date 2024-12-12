import * as dotenv from 'dotenv';
dotenv.config();
import type {S3Event} from 'aws-lambda';
import { SQSClient, ReceiveMessageCommand,DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { AssignPublicIp, ECSClient , LaunchType, RunTaskCommand} from '@aws-sdk/client-ecs';
import { networkInterfaces } from 'os';
const client = new SQSClient({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
    },
    region: 'ap-south-1'
});
const ecsClient=new ECSClient({
    region:'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
    },
});
async function init() {

  
console.log('Initializing the SQS listener');

    const command = new ReceiveMessageCommand({
        QueueUrl: process.env.SQS_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds:10
    });

    
    while (true) {
        
        const { Messages } = await client.send(command);
        if (!Messages) {
            console.log('No messages, Retrying...');
            continue;
        }

        for (const message of Messages) {
            const {MessageId, Body}=message;
            console.log(MessageId, Body);
            if(!Body){
                continue;
                console.log('No body, skipping...');
            }
            //validate ythe event 
            // const event=JSON.parse(Body);
            // console.log("Parsed Event",event);
                // Attempt to parse the body as JSON
    let event;
    try {
        event = JSON.parse(Body);
    } catch (error) {
        console.error("Failed to parse message body as JSON:", error);
        console.log("Message body was:", Body);
        continue; // Skip to the next message
    }

    console.log("Parsed Event", event);

    //Ignoreing test events
    if("Service" in event && "Event" in event){
        if(event.Event=="s3:TestEvent")continue;
    }for(const record of event.Records){
        const {s3}=record;
        const {
            bucket,
            object:{key}
        }=s3;
        console.log('Starting task for bucket',bucket.name, 'and key',key);
        //Spin the docker container

        const runTaskCommand=new RunTaskCommand({
            taskDefinition: process.env.TASK_DEFINITION as string,
            cluster: process.env.CLUSTER as string,
            launchType:"FARGATE",
            networkConfiguration:{
               awsvpcConfiguration:{
                assignPublicIp:"ENABLED",
                securityGroups:["sg-0684ea15e3f318e2b"],
                subnets:[ "subnet-0afff0828ecad5840",
                    "subnet-04205df0058101780",
                    "subnet-0f1b594bde4164e69",
                    "subnet-081fd3bff50a07b15"]
               }

            },
            overrides:{
                containerOverrides:[{
                    name:"VideoTranscodingHLSStreaming",
                    environment:[
                        {name:"S3_BUCKET", value:bucket.name},
                        {name:"Key", value:key}
                    ]
                }]
            }
        });
        //spin the docker container 

            //delete the message from Queue
            // const deleteCommand = new DeleteMessageCommand({
            //     QueueUrl: process.env.SQS_URL as string,
            //     ReceiptHandle: message.ReceiptHandle
            // });


            // await ecsClient.send(runTaskCommand);
        try{
            const taskResponse=await ecsClient.send(runTaskCommand);
            console.log("Task started successfully",taskResponse);
        }catch(e){
            console.log("Error starting task",e);
        }
    }

            
            //DEleting the msg from Queue
       
            try {
                console.log(`Deleting message from the queue...`);
                await client.send(
                    new DeleteMessageCommand({
                        QueueUrl: process.env.SQS_URL as string,
                        ReceiptHandle: message.ReceiptHandle
                    })
                );
                console.log(`Message ID: ${MessageId} deleted successfully.`);
            } catch (deleteError) {
                console.error("Error deleting message from queue:", deleteError);
            }
        } 
    }
} 


init().catch(error => console.error("Unhandled error in init:", error));
