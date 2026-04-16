#!/bin/bash
# Creates the S3 bucket used by PharmaTrack for POD photo uploads.
# This script runs automatically when LocalStack is ready.

awslocal s3 mb s3://pharmatrack-uploads --region ap-southeast-1
echo "Created bucket: pharmatrack-uploads"
