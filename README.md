# To run the backend

1. `cd backend`
2. `npm start`
   - **NOTE**: You may have to run `npm i` to get required depdendencies before running `npm start`

# To run the frontend

1. `cd frontend`
2. Start app
   - `npm run dev` (to run in development/"hot reload" mode).
   - `npm start` to create an optimized production build and serve that.
     - Again, you may have to run `npm i` to install the necessary dependencies

# To run both, simultaneously

- work in progress. Docker?

# To run Emotion API
1. Follow Vision AI to get API in JSON file.
   - Further instructions in Google Cloud Vision API Docs.
2. Set env variable to point to JSON file. 
   - **NOTE** Muse be done every terminal session.
   - Further instructions in Google Cloud Vision API Docs. 
   
# To run Spotify API
1. Follow Spotify Web API instructions to get API key, client key, etc.
2. Setup the following in the backend directory inside a .env file:

   REDIRECT_URI=http://localhost:8888/callback
   CLIENT_ID=your-client-id
   CLIENT_SECRET=your-clientsecret
   PORT=8888
3. Run the application (front end/backend)
4. Sign into your Spotify **premium** account and authorize all credentials.

# TODO:

1. Sort songs by dominant emotion in code.
2. Add songs to playlist.
3. Fix bug where taking photo too fast throws an error. (Photo can be taken again soon afterwards)

# Directory contents

- frontend: React application
- backend: Express application
- misc: Balsamiq mockup project and PDF
