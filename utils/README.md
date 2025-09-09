# TODO

---

## Legend

- 🔴 **HIGH:** High priority / urgent
- 🟠 **MEDIUM:** Medium priority
- 🟡 **LOW:** Low priority
- 🟢 **MINOR:** Minor / nice to have
- ❄️ **FROZEN:** Frozen / blocked / on hold

---

## Docs

*No urgent items.*

### Navigation
- ❄️ **FROZEN:** Can we compress/expand the different sections?
- ❄️ **FROZEN:** When Lucene is unpinned need to change the search index definition removing facets and keeping only token

- 🟡 **LOW:** Replace the correct email for Arena in the Portal
- 🔴 **HIGH:** Exercise with RankFusion

---

## App

*No current items.*

---

## Server

### Answers
- 🔴 **HIGH:** Can I use 2 folders when deciding the scenario. lab and answer.

---

## Terraform

### Deploy
- ❄️ **FROZEN:** Cluster name change to arena-eks from gameday-eks
- ❄️ **FROZEN:** S3 bucket change to mongodb-arena from mongodb-gameday
- 🔴 **HIGH:** Redis depends to scenario too
- 🔴 **HIGH:** MountVolume.MountDevice failed for volume "pvc-c6da3730-60e3-4676-a052-a4cf85f0df69" : kubernetes.io/csi: attacher.MountDevice failed to create newCsiDriverClient: driver name efs.csi.aws.com not found in the list of registered CSI drivers

### Atlas cluster
- ❄️ **FROZEN:** (When auto-embedding is GA) Bring back the Atlas resource for project! Now is using an already created project because of auto-embedding!
- ❄️ **FROZEN:** When Lucene is unpinned need to change the search index definition removing facets and keeping only token
- ❄️ **FROZEN:** Can I filter the Load Sample Dataset to the single database


### Open VSCode
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