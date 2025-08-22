# TODO

---

## Docs

### Instructions
- 🟡 **MEDIUM:** Prompt for auto embedding is not working (make it more explicit).

---

## App

*No current items.*

---

## Server

### Autocomplete
- 🟢 **LOW:** VSCode does not show MongoDB methods (.find(), .findOne()) as suggestions.

### Results
- 🔴 **HIGH:** Test results should be visible in the frontend for better feedback.
- 🟠 **MEDIUM:** Release the answers after a period of time.

---

## Terraform

- 🟡 **MEDIUM:** Bring back the Atlas resource for project! Now is using an already created project because of auto-embedding!

### LiteLLM
- 🔴 **HIGH:** Is there a way to force prompt caching to stay active?

### test
- 🟠 **MEDIUM:** How to deploy only certain scenarios.
- 🟢 **LOW:** Send EKS logs to S3.
- 🟢 **LOW:** Ensure all files are present after pod failures.
openvscode-server@vscode-callen-mdb-openvscode-c68f9d655-7jj7v:~/mongodb-airbnb-workshop$ git push
fatal: not a git repository (or any parent up to mount point /home)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).

### OIDC
- 🟡 **MEDIUM:** Ask if it is possible to have OIDC (current SA profile does not allow).

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

- **LLM:** $60 for 25 people

---

## Workshop Stats

- 10 out of 25 completed all the exercises in 2.5 hours.
