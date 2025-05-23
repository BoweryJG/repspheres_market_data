# Market Intelligence Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to perform search. Please try again." Error

This error typically occurs when the search service cannot connect to the backend server. Here are the steps to resolve it:

#### Step 1: Check if the Server is Running

The application requires a backend server running on port 3001. 

**To start the server:**

```bash
cd server
npm install  # If not already done
npm start
```

You should see: `News proxy service running on port 3001`

#### Step 2: Configure the Brave Search API Key

The server needs a Brave Search API key to function properly.

1. **Create a server/.env file** (if it doesn't exist):
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Add your Brave Search API key** to `server/.env`:
   ```
   PORT=3001
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   BRAVE_SEARCH_API_KEY=your_actual_brave_api_key_here
   ```

3. **Get a Brave Search API key**:
   - Visit https://brave.com/search/api/
   - Sign up for an account
   - Create a new API key
   - Copy the key and paste it in your server/.env file

4. **Restart the server** after adding the API key:
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   npm start
   ```

#### Step 3: Verify the Frontend Configuration

Ensure your frontend `.env` file has the correct configuration:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_URL=http://localhost:3001
VITE_BRAVE_API_KEY=your_brave_api_key_here
```

Note: The VITE_BRAVE_API_KEY in the frontend .env is not currently used since we're proxying through the server, but it's good to have it configured.

#### Step 4: Check Browser Console

Open your browser's developer console (F12) and look for:
- Network errors (red requests to localhost:3001)
- Console error messages with specific details

### 2. CORS Errors

If you see CORS errors in the browser console:

1. Ensure the server is running on the correct port (3001)
2. Check that the server's CORS middleware is properly configured (it should be by default)

### 3. Production Deployment Issues

For production deployment:

1. **Update the proxy URL** in `src/services/braveSearchService.ts` if your server is deployed elsewhere
2. **Set environment variables** on your hosting platform:
   - For the server: BRAVE_SEARCH_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
   - For the frontend: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL

### 4. Testing the Search Functionality

To test if everything is working:

1. **Test the server directly**:
   ```bash
   curl "http://localhost:3001/api/search/brave?query=dental+implants&limit=5"
   ```

   You should see JSON search results.

2. **Test from the application**:
   - Open the dashboard
   - Click the search icon in the top bar
   - Type a query like "dental implants"
   - You should see results with sentiment indicators

### 5. Debug Mode

The updated braveSearchService.ts includes console logging. Check your browser console for:
- "Brave Search Request:" - Shows the request being made
- "Brave Search Response:" - Shows successful responses
- "Brave Search Error:" - Shows detailed error information

### Quick Checklist

- [ ] Server is running on port 3001
- [ ] server/.env file exists with BRAVE_SEARCH_API_KEY
- [ ] Brave API key is valid and active
- [ ] Frontend can connect to http://localhost:3001
- [ ] No firewall blocking port 3001
- [ ] Browser console checked for errors

### Still Having Issues?

If you're still experiencing problems:

1. Check the server logs for error messages
2. Verify your Brave API key is active and has available credits
3. Try a simple test query directly to Brave's API:
   ```bash
   curl -H "X-Subscription-Token: YOUR_API_KEY" \
     "https://api.search.brave.com/res/v1/web/search?q=test"
   ```

4. Ensure all dependencies are installed:
   ```bash
   # In the root directory
   npm install
   
   # In the server directory
   cd server
   npm install
   ```

### Contact Support

If none of the above solutions work, please provide:
- Browser console errors
- Server console output
- Network tab showing failed requests
- Your environment (OS, Node version, browser)
