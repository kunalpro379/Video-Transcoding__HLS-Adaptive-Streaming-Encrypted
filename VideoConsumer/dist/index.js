"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const client_sqs_1 = require("@aws-sdk/client-sqs");
const client_ecs_1 = require("@aws-sdk/client-ecs");
const client = new client_sqs_1.SQSClient({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: 'ap-south-1'
});
const ecsClient = new client_ecs_1.ECSClient({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
});
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Initializing the SQS listener');
        const command = new client_sqs_1.ReceiveMessageCommand({
            QueueUrl: process.env.SQS_URL,
            MaxNumberOfMessages: 1,
            WaitTimeSeconds: 10
        });
        while (true) {
            const { Messages } = yield client.send(command);
            if (!Messages) {
                console.log('No messages, Retrying...');
                continue;
            }
            for (const message of Messages) {
                const { MessageId, Body } = message;
                console.log(MessageId, Body);
                if (!Body) {
                    continue;
                    console.log('No body, skipping...');
                }
                //validate ythe event 
                const event = JSON.parse(Body);
                console.log("Parsed Event", event);
                //Ignoreing test events
                if ("Service" in event && "Event" in event) {
                    if (event.Event == "s3:TestEvent")
                        continue;
                }
                for (const record of event.Records) {
                    const { s3 } = record;
                    const { bucket, object: { key } } = s3;
                    console.log('Starting task for bucket', bucket.name, 'and key', key);
                    //Spin the docker container
                    const runTaskCommand = new client_ecs_1.RunTaskCommand({
                        taskDefinition: process.env.TASK_DEFINITION,
                        cluster: process.env.CLUSTER,
                        launchType: "FARGATE",
                        networkConfiguration: {
                            awsvpcConfiguration: {
                                assignPublicIp: "ENABLED",
                                securityGroups: ["sg-0684ea15e3f318e2b"],
                                subnets: ["subnet-0afff0828ecad5840",
                                    "subnet-04205df0058101780",
                                    "subnet-0f1b594bde4164e69",
                                    "subnet-081fd3bff50a07b15"]
                            }
                        },
                        overrides: {
                            containerOverrides: [{
                                    name: "VideoTranscodingHLSStreaming",
                                    environment: [
                                        { name: "S3_BUCKET", value: bucket.name },
                                        { name: "Key", value: key }
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
                    try {
                        const taskResponse = yield ecsClient.send(runTaskCommand);
                        console.log("Task started successfully", taskResponse);
                    }
                    catch (e) {
                        console.log("Error starting task", e);
                    }
                }
                //DEleting the msg from Queue
                try {
                    console.log(`Deleting message from the queue...`);
                    yield client.send(new client_sqs_1.DeleteMessageCommand({
                        QueueUrl: process.env.SQS_URL,
                        ReceiptHandle: message.ReceiptHandle
                    }));
                    console.log(`Message ID: ${MessageId} deleted successfully.`);
                }
                catch (deleteError) {
                    console.error("Error deleting message from queue:", deleteError);
                }
            }
        }
    });
}
init().catch(error => console.error("Unhandled error in init:", error));
