# Deploy Your Project - Super Simple Version

**Goal**: Take what you have running on your computer and put it on the internet so your friend can see it.

---

## STEP 1: Create a Free Database Online (5 minutes)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Sign Up Free"
3. Create account with your email
4. Check email, click the link
5. Login
6. Click "Create a Deployment"
7. Choose "M0" (the free one) - it's already selected
8. Click "Create Deployment"
9. Wait... it's making your database...

**Once it says "Deployed":**
1. Click "Security" on left menu
2. Click "Database Access"
3. Click "Add New Database User"
4. Type username: `admin`
5. Type password: write down something like `MySecurePassword123`
6. Click "Add User"

Now go back to Security menu:
1. Click "Network Access"
2. Click "Add IP Address"
3. Click the button that says "Allow Access from Anywhere"
4. Click "Confirm"

**Now get your database link:**
1. Click "Databases" (top of page)
2. Click the green "Connect" button
3. Click "Drivers"
4. Make sure "Node.js" is selected
5. Copy the long connection string that looks like:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password you wrote down (example: `MySecurePassword123`)
7. **SAVE THIS STRING - YOU NEED IT**

---

## STEP 2: Upload Your Project to GitHub (10 minutes)

1. Go to: https://github.com
2. Sign up if you don't have account
3. Login
4. Click "+" button (top right)
5. Click "New repository"
6. Name it: `menu-bloom-demo`
7. Click "Create repository"

Now on your computer:
1. Open PowerShell in your project folder
2. Type these commands one by one:
   ```
   git init
   git add .
   git commit -m "first upload"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/menu-bloom-demo.git
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your actual GitHub username)

**Done!** Your project is now on GitHub.

---

## STEP 3: Deploy Backend (Your Server) - 10 minutes

Go to: https://render.com
1. Click "Sign Up"
2. Click "Continue with GitHub"
3. Let it connect to GitHub
4. Click "New +"
5. Click "Web Service"
6. Find your `menu-bloom-demo` repo and click it
7. Click "Connect"

**In the form that appears:**
- **Name**: `menu-bloom-api`
- **Environment**: `Node`
- **Build Command**: 
  ```
  cd server && npm install && npm run build
  ```
- **Start Command**: 
  ```
  cd server && npm start
  ```

**Scroll down to "Environment":**
Add these variables:
- `NODE_ENV` = `production`
- `MONGODB_URI` = (paste your database string from Step 1)
- `JWT_SECRET` = `this_is_a_secret_key_at_least_32_characters_long_ok`
- `CORS_ORIGIN` = (leave empty for now, we'll update it later)

Click "Create Web Service"

**WAIT 3-5 MINUTES** for it to build...

When it says "Live", go to the URL it gives you (like `https://menu-bloom-api.onrender.com`)

Add `/api/v1/health` to the end and visit it. If you see text, it worked!

**SAVE THIS URL** - you need it next.

---

## STEP 4: Deploy Frontend (What Your Friend Sees) - 10 minutes

Go to: https://vercel.com
1. Click "Sign Up"
2. Click "Continue with GitHub"
3. Let it connect
4. Click "Add New"
5. Click "Project"
6. Find `menu-bloom-demo` and click "Import"

**In the next screen:**
- **Framework**: Choose `Vite`
- Leave everything else as is
- Scroll down

**Find "Environment Variables":**
Add two variables:
- **Name**: `VITE_API_BASE_URL`
- **Value**: (paste the URL from Step 3 + `/api/v1`)
  
  Example: `https://menu-bloom-api.onrender.com/api/v1`

- **Name**: `VITE_RESTAURANT_ID`
- **Value**: `demo-cafe`

Click "Deploy"

**WAIT 2-3 MINUTES**...

When it says "Congratulations!", click the link. You now have your project ONLINE!

**SAVE THIS URL** - this is what you send to your friend.

---

## STEP 5: Connect Backend and Frontend (2 minutes)

Go back to Render dashboard:
1. Click your `menu-bloom-api` service
2. Go to "Environment"
3. Find `CORS_ORIGIN`
4. Set it to your Vercel URL (from Step 4)

Example: `https://menu-bloom-demo.vercel.app`

Scroll down and click "Save Changes"

Wait 1-2 minutes...

---

## STEP 6: Test It Works (5 minutes)

1. Open your Vercel link in browser
2. Should see login page
3. Login with your credentials
4. Can you see the menu?
5. Try adding a new item
6. Does it work?

**If something doesn't work:**
- Check the URL at top of browser
- Try refreshing (Ctrl+R)
- Wait 30 seconds (backend might be sleeping)
- Try again

---

## STEP 7: Send to Your Friend

Send them this link:
```
https://menu-bloom-demo.vercel.app
```

They can:
- See the menu
- Place orders
- Try out the app

**Note**: First request might take 30 seconds (backend wakes up from sleep).

---

## That's It!

Your project is now online and shareable. Any changes you make locally:
1. Do: `git add . && git commit -m "changes" && git push`
2. Both Vercel and Render automatically redeploy (takes 2-3 minutes)
3. Your friend sees the updates

**If you need to reset/delete:**
- Vercel: Go to project settings, scroll to "Danger Zone", delete
- Render: Go to service settings, scroll down, delete
- MongoDB: Atlas dashboard, delete cluster

Good luck! 🚀
