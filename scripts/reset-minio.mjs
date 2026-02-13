import { Client } from 'minio';
// dotenv is loaded via --import=dotenv/config flag

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

async function resetMinIO() {
    try {
        console.log('🔄 Resetting MinIO storage...');

        // List all buckets
        const buckets = await minioClient.listBuckets();
        console.log(`Found ${buckets.length} bucket(s)`);

        // Remove all objects and buckets
        for (const bucket of buckets) {
            console.log(`  Clearing bucket: ${bucket.name}`);
            const objectsStream = minioClient.listObjects(bucket.name, '', true);

            for await (const obj of objectsStream) {
                await minioClient.removeObject(bucket.name, obj.name);
                console.log(`    Removed: ${obj.name}`);
            }

            await minioClient.removeBucket(bucket.name);
            console.log(`  Deleted bucket: ${bucket.name}`);
        }

        // Recreate required buckets
        const requiredBuckets = ['contracts', 'documents'];
        console.log(`\n📦 Creating required buckets...`);

        for (const bucketName of requiredBuckets) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`  ✓ Created bucket: ${bucketName}`);
        }

        console.log('\n✅ MinIO storage reset complete!');
    } catch (error) {
        console.error('❌ Error resetting MinIO:', error.message);
        process.exit(1);
    }
}

resetMinIO();
