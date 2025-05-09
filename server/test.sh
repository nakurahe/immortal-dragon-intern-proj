#!/bin/sh

# # register test user
# curl -X POST http://localhost:5000/api/auth/register \
#   -H 'Content-Type: application/json' \
#   -d '{
#     "username": "testuser",
#     "password": "testpassword",
#     "email": "testemail@gmail.com"
#   }'

# login test user && get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "testemail@gmail.com",
    "password": "testpassword"
  }' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# echo "Token: $TOKEN"

# # Use token to get user info
# curl -X GET http://localhost:5000/api/auth/me \
#   -H 'Content-Type: application/json' \
#   -H "Authorization: Bearer $TOKEN"

# # Get one task
# curl -X GET http://localhost:5000/api/tasks \
#   -H 'Content-Type: application/json' \
#   -H "Authorization: Bearer $TOKEN"

# curl -X GET https://newsapi.org/v2/everything \
#   -H 'Content-Type: application/json' \
#   -d '{
#     "q": "Japan",
#     "from": "2025-05-06T21:55:53.349Z",
#     "sources": "bbc-news,cnn,fox-news,the-washington-post",
#     "language": 'en',
#     "sortBy": 'publishedAt',
#     "page": "1",
#     "pageSize": "10",
#     "apiKey": "6a3c92a44050458bbb3efb9b8a87c008"
#   }'

# Get statistics
curl -X GET http://localhost:5000/api/news/stat \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN"
