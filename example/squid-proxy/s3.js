const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");
const { HttpsProxyAgent } = require('https-proxy-agent');

async function listS3Buckets() {
    const client = new S3Client({
        region: "us-west-2",
        // If using the proxy, uncomment and configure these lines
        // httpAgent: new HttpsProxyAgent('http://your-nlb-dns:3128'),
        // httpsAgent: new HttpsProxyAgent('http://your-nlb-dns:3128')
    });

    try {
        const command = new ListBucketsCommand({});
        const response = await client.send(command);
        
        console.log("Available S3 Buckets:");
        response.Buckets?.forEach(bucket => {
            console.log(`- ${bucket.Name} (Created: ${bucket.CreationDate})`);
        });
    } catch (error) {
        console.error('Error listing buckets:', error);
        process.exit(1);
    }
}

// Run the function
listS3Buckets();

