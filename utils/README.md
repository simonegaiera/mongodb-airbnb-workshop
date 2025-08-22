# TODO

## Docs

### instructions
- prompt for auto embedding is not working (change it to more explicit)

## App

## Server

### autocomplete
- (Low) VSCode does not shows MongoDB methods (.find(), .findOne()) as suggestion

### results
- (High) the test results should be visible in the frontend to have them see the so what
- (Mid) release the answers after a period of time

## Terraform

BRING BACK THE ATLAS MAIN FOR PROJECT!

### litellm
- can enabling cache saving $?


### test
- how to deploy only certain scenarios
- send eks logs to s3
- i need to make sure all the files are there, I had a failure on a pod
openvscode-server@vscode-callen-mdb-openvscode-c68f9d655-7jj7v:~/mongodb-airbnb-workshop$ git push
fatal: not a git repository (or any parent up to mount point /home)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).

### OIDC
- ask if is possible to have OIDC, the SA profile does not allows it now


## Sizing Expectation
- VSCode: 100 users will require 20 nodes
    - 14 x c6a.xlarge
    - 3 x c6a.2xlarge
    - 3 x c6a.4xlarge
- LLM: 60$ for LLM 25 people

- 10 out of 25 completed all the exercises in 2.5 hours
