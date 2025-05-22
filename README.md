# RepSpheres Market Data

This project provides a web interface and server for viewing market data stored in Supabase. Below are instructions for installing dependencies, setting environment variables, running the app, and verifying that the database tables contain data.

## Prerequisites

- Node.js 18 or later
- [Supabase CLI](https://supabase.com/docs/guides/cli) for local function testing

## Install Dependencies

1. Install JavaScript dependencies for the web app:
   ```bash
   npm install
   ```
2. Install the server dependencies:
   ```bash
   cd server
   npm install
   cd ..
   ```

## Environment Variables

Create `.env.local` in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

These variables are read in `src/services/supabaseClient.ts`:

```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
```

The Express server uses similar variables in `server/index.js`:

```js
const response = await axios.get(
  `${process.env.SUPABASE_URL}/rest/v1/v_news_by_procedure_category?...`,
  { headers: { apikey: process.env.SUPABASE_ANON_KEY } }
);
```

You can copy `.env.local` to `server/.env` and rename the variables to `SUPABASE_URL` and `SUPABASE_ANON_KEY` as needed. If you plan to call the `list-tables` function locally, set `SUPABASE_SERVICE_ROLE_KEY` as well.

## Running the App

1. Start the Express server:
   ```bash
   cd server
   npm start
   ```
2. In another terminal, run the Vite development server:
   ```bash
   npm run dev
   ```

The web app will be available at `http://localhost:5173` by default.

## Verifying Database Tables

The repository contains a Supabase Edge Function located at `supabase/functions/list-tables` which lists all tables and a small sample of their data. The function expects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables. You can run it locally using the Supabase CLI:

```bash
supabase functions serve list-tables
```

Then call the function:

```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/list-tables' \
  --header 'Authorization: Bearer <anon-key>' \
  --header 'Content-Type: application/json'
```

The output will show each table name with row counts. Confirm that `category_hierarchy`, `dental_companies`, and `aesthetic_companies` have rows. Alternatively, you can open the Supabase dashboard, navigate to the **Table Editor**, and check that these tables contain data.

## Live Stock Ticker

The dashboard includes a stock ticker component that cycles through ticker symbols found in the
`dental_companies` and `aesthetic_companies` tables. When the app starts, the ticker fetches real-time
prices from the Yahoo Finance API and displays them in the header. Network access is required for the
price lookup.

