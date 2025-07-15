---
title: "Validate Your Results"
permalink: /test/
layout: single
classes: wide
---

## ✅ Validate Your Results

Every great journey needs checkpoints—and this is yours! As you build out your rental platform, it's time to see if your code is ready to power the next big thing. Testing your work is how you make sure every feature works perfectly for your users and your business.

Follow these steps to put your code to the test and claim your spot on the leaderboard:

1. **Run the Test Suite**  
   - Open a new terminal:
     ```
     ☰ > Terminal > New Terminal
     ```
   - Fire up the test suite:
     ```bash
     cd server/
     npm test
     ```
   This command will automatically check each function you've worked on—just like a real-world deployment.

2. **Run Specific Tests** (Optional)  
   Want to focus on a particular challenge? You can run specific tests instead of the entire suite:
   ```bash
   
   # Run only tests matching "vector-search-1"
   npm test -- --test=vector-search-1
   
   # Run tests matching any pattern
   npm test -- --test="your-pattern-here"
   ```
   - 🎯 This is perfect for debugging specific features or when working on individual challenges.
   - 🔄 Unlike the full suite, specific tests won't stop on the first failure—they'll run all matching tests.

3. **Review Your Test Results**  
   - ✅ Green means your code is ready for production—your users will love it!
   - ❌ Red? No worries! Error messages will help you pinpoint what to fix and try again.

4. **Completion Criteria**  
   - 🏁 All tests must pass for your challenge to be complete.
   - 🔄 If something fails, review the feedback, tweak your code, and test again.

5. **Troubleshooting**  
   - 📂 Make sure you're in the correct directory before running tests.
   - 📦 Double-check that all dependencies are installed.

**Ready to show your skills? Run those tests, crush those bugs, and climb the leaderboard as your platform comes to life! 🚀**
