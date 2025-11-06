# GitHub Setup Commands (PowerShell)

# Step 1: Navigate to project directory
cd "C:\Users\Jenkinson\Downloads\projects\Exam Allocation System"

# Step 2: Check git status
git status

# Step 3: Add all files
git add .

# Step 4: Create initial commit
git commit -m "Initial commit: Exam Allocation System"

# Step 5: Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Step 6: Rename branch to main (if needed)
git branch -M main

# Step 7: Push to GitHub
git push -u origin main

