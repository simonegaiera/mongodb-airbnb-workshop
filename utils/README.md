# TODO

---

## Docs

*No current items.*

---

## App

*No current items.*

---

## Server

### Results
- 🔴 **HIGH:** Test results should be visible in the frontend for better feedback.
- 🔴 **HIGH:** [Validation] On server restart, run the results-processor. Or then 30 seconds.
- 🟠 **MEDIUM:** [Validation] Use the LLM to release the answers after a period of time. Add something in the guideline to do it.

---

## Terraform


### Atlas cluster
- 🟡 **MEDIUM:** Bring back the Atlas resource for project! Now is using an already created project because of auto-embedding!
- 🟠 **MEDIUM:** Validate it can be done without the csv, just with additional users

### test
- 🟠 **MEDIUM:** How to deploy only certain scenarios.
- 🟢 **LOW:** Send EKS logs to S3.
- 🟢 **LOW:** Ensure all files are present after pod failures.
openvscode-server@vscode-callen-mdb-openvscode-c68f9d655-7jj7v:~/mongodb-airbnb-workshop$ git push
fatal: not a git repository (or any parent up to mount point /home)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).

### OIDC
- 🟡 **MEDIUM:** Ask if it is possible to have OIDC (current SA profile does not allow).


## NYC .Local

- Flexible Schema
- Compound Indexing

### Exercises

- (Meh) Simple Find
- (Meh) Simple Create
- (X) Insert Reviews (Update with increment)
- More complicated aggregation pipeline
- (X) Search
- (X) Vector and auto-embedding

---

## Sizing Expectation

- **VSCode:** 100 users will require 20 nodes  
    - 14 × c6a.xlarge (~$0.19/hr each)  
    - 3 × c6a.2xlarge (~$0.38/hr each)  
    - 3 × c6a.4xlarge (~$0.76/hr each)  
    - **Estimated daily cost:**  
        - 14 × c6a.xlarge: 14 × $0.19 × 24 = **$63.84/day**  
        - 3 × c6a.2xlarge: 3 × $0.38 × 24 = **$27.36/day**  
        - 3 × c6a.4xlarge: 3 × $0.76 × 24 = **$54.72/day**  
        - **Total: ~$146/day**

- **LLM:** $60 per scenario for 25 people  
    - For 100 people: 100 / 25 = 4 scenarios  
    - **Total LLM cost for 100 people:** 4 × $60 = **$240**

## Workshop Stats

- 10 out of 25 completed all the exercises in 2.5 hours.