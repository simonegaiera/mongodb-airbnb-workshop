# TODO

---

## Docs

*No urgent items.*

### Navigation
- ❄️ **FROZEN:** Can we compress/expand the different sections?
- ❄️ **FROZEN:** When Lucene is unpinned need to change the search index definition removing facets and keeping only token

---

## App

*No current items.*

---

## Server

### Answers
- 🟡 **MID:** [Validation] Use the LLM to release the answers after a period of time. Add something in the guideline to do it.
- 🟡 **MID:** Show the connection string when reconnecting
---

## Terraform

## Result processor
- 🟡 **MID:** should exclude the answer when getting the results

### Deploy
- ❄️ **FROZEN:** Cluster name change to arena-eks from gameday-eks
- ❄️ **FROZEN:** S3 bucket change to mongodb-arena from mongodb-gameday

### Atlas cluster
- ❄️ **FROZEN:** (When auto-embedding is GA) Bring back the Atlas resource for project! Now is using an already created project because of auto-embedding!
- ❄️ **FROZEN:** When Lucene is unpinned need to change the search index definition removing facets and keeping only token
- 🟢 **LOW:** Can I filter the Load Sample Dataset to the single database


### Open VS Code
- ❄️ **FROZEN:** [Changes were made] Understand why the firewall was blocking it and how to avoid it

### OIDC
- ❄️ **FROZEN:** Ask if it is possible to have OIDC (current SA profile does not allow).


## Kanopy

### Deploy
- ❄️ **FROZEN:** Deploy on Kanopy


## NYC .Local

### Exercises

- (Meh) Simple Find
- (Meh) Simple Create
- (X) Insert Reviews (Update with increment)
- More complicated aggregation pipeline
- (X) Search
- (X) Vector and auto-embedding

---

## Sizing Expectation

- **VSCode:** 100 users will require 20 nodes (limits were changed, will be more)
    - 14 × c6a.xlarge
    - 3 × c6a.2xlarge
    - 3 × c6a.4xlarge

- **LLM:** $60 per scenario for 25 people  

## Workshop Stats

- 10 out of 25 completed all the exercises in 2.5 hours.