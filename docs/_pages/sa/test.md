---
title: "Development: Validate Your Results"
permalink: /sa/test/
layout: single
classes: wide
---

## ✅ Validate Your Results

Every great journey needs checkpoints—and this is yours! As you build out your rental platform, it's time to see if your code is ready to power the next big thing. Testing your work is how you make sure every feature works perfectly for your users and your business.

Follow these steps to put your code to the test and claim your spot on the leaderboard:

1. **Compile the Results Processor** (First Time Setup)  
   Before you can run the tests, you need to compile the results processor from the utils folder:
   ```bash
   cd utils/eks-cluster/results-processor
   mvn clean package
   cd ../../../
   ```
   This will create the `results-processor-1.0.0.jar` file in the `target` directory. You only need to do this once, unless the processor code is updated.

2. **Run the Configuration Test**  
   Execute the results processor to validate your setup:
   ```bash
   java -jar utils/eks-cluster/results-processor/target/results-processor-1.0.0.jar
   ```

3. **Review Your Test Results**  
   - ✅ Green means your code is ready for production—your users will love it!
   - ❌ Red? No worries! Error messages will help you pinpoint what to fix and try again.

4. **Completion Criteria**  
   - 🏁 All tests must pass for your challenge to be complete.
   - 🔄 If something fails, review the feedback, tweak your code, and test again.

5. **Troubleshooting**  
   - 📂 Make sure you're in the correct directory before running tests.
   - 📦 Double-check that all dependencies are installed (including Maven for compilation).
   - ☕ Ensure Java is properly installed and accessible from your command line.

**Ready to show your skills? Run those tests, crush those bugs, and climb the leaderboard as your platform comes to life! 🚀**
