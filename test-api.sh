#!/bin/bash

API_URL="http://localhost:5000"
TOKEN=""

echo "Testing API endpoints..."

# Test registration
echo "\nTesting registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}')
echo $REGISTER_RESPONSE

# Test login
echo "\nTesting login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}')
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo $LOGIN_RESPONSE

if [ -z "$TOKEN" ]
then
  echo "Failed to get token. Exiting..."
  exit 1
fi

# Test protected endpoints with token
echo "\nTesting protected endpoints..."

# Get user profile
echo "\nTesting get profile..."
curl -s -X GET "$API_URL/api/auth/profile" \
  -H "Authorization: Bearer $TOKEN"

# Get all projects
echo "\nTesting get all projects..."
curl -s -X GET "$API_URL/api/projects" \
  -H "Authorization: Bearer $TOKEN"

# Create new team
echo "\nTesting create team..."
TEAM_RESPONSE=$(curl -s -X POST "$API_URL/api/teams" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Test Team", "description": "Test Team Description"}')
TEAM_ID=$(echo $TEAM_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo $TEAM_RESPONSE

# Create new project
echo "\nTesting create project..."
PROJECT_RESPONSE=$(curl -s -X POST "$API_URL/api/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Test Project", "description": "Test Description", "key": "PROJ1", "teamId": "'$TEAM_ID'"}')
PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo $PROJECT_RESPONSE

# Get single project
echo "\nTesting get single project..."
curl -s -X GET "$API_URL/api/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN"

# Get dashboard stats
echo "\nTesting dashboard stats..."
curl -s -X GET "$API_URL/api/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN"

# Get dashboard activity
echo "\nTesting dashboard activity..."
curl -s -X GET "$API_URL/api/dashboard/activity" \
  -H "Authorization: Bearer $TOKEN" 