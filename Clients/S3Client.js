const AWS = require('aws-sdk');

class S3Client {
  constructor() {
    this.s3 = new AWS.S3();
  }

  async getObject(bucketName, key) {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      const data = await this.s3.getObject(params).promise();
      return data.Body.toString();
    } catch (error) {
      console.error('Error getting object from S3:', error);
      throw error;
    }
  }

  async putObject(bucketName, key, data, contentType) {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: data,
      ContentType: contentType,
    };

    try {
      await this.s3.putObject(params).promise();
      console.log('Object uploaded successfully.');
    } catch (error) {
      console.error('Error putting object to S3:', error);
      throw error;
    }
  }

  async getPresignedUrl(bucketName, key, filetype, expiration = 300) {
    const params = {
      Bucket: bucketName,
      Key: key,
      ContentType: filetype,
      Expires: expiration,
    };
    console.log(params)
    try {
      const url = await this.s3.getSignedUrlPromise('putObject', params);
      return url;
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw error;
    }
  }

  async deleteObject(bucketName, key) {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
      console.log('Object deleted successfully.');
    } catch (error) {
      console.error('Error deleting object from S3:', error);
      throw error;
    }
  }
}

module.exports = S3Client;
// Example usage:
// const s3Config = { accessKeyId: 'YOUR_ACCESS_KEY_ID', secretAccessKey: 'YOUR_SECRET_ACCESS_KEY', region: 'YOUR_S3_REGION' };
// const s3Client = new S3Client(s3Config);
// s3Client.getObject('YOUR_BUCKET_NAME', 'yourObjectKey.txt').then(data => console.log(data));
// s3Client.putObject('YOUR_BUCKET_NAME', 'yourObjectKey.txt', 'Hello, S3!', 'text/plain');
// s3Client.getPresignedUrl('YOUR_BUCKET_NAME', 'yourObjectKey.txt').then(url => console.log(url));
// s3Client.deleteObject('YOUR_BUCKET_NAME', 'yourObjectKey.txt');
