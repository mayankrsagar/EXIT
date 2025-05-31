#!/bin/bash

# Backend setup
cd backend

# Create required .env file
cat <<EOF > .env
MONGO_URI=mongodb://localhost:27017/exitdb
JWT_SECRET=testsecret
PORT=5000
CALENDARIFIC_API_KEY=dummy_key  # Bypass holiday check
EOF

npm install

# Start backend server
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 5  # Initial wait
curl --retry 5 --retry-delay 3 --retry-connrefused http://localhost:5000/api/health || exit 1

cd ..

# Assessment setup
cd assessment

# Create Cypress configuration
cat <<EOF > cypress.json
{
  "baseUrl": "http://localhost:5000",
  "defaultCommandTimeout": 10000
}
EOF

npm install

# Run Cypress tests
npx cypress run
TEST_RESULT=$?

# Cleanup
kill $BACKEND_PID
exit $TEST_RESULT