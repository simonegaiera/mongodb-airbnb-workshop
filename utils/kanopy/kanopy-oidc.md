$ curl -L https://github.com/harness/drone-cli/releases/latest/download/drone_darwin_amd64.tar.gz | tar zx
$ sudo cp drone /usr/local/bin

https://github.com/kanopy-platform/kanopy-oidc?tab=readme-ov-file
sudo ln -sf ~/Documents/kanopy-oidc-macos-arm64-v0.5.3/bin/kanopy-oidc-macos-arm64-v0.5.3 /usr/local/bin/kanopy-oidc
helm plugin install https://github.com/kanopy-platform/ksec

CLUSTER=staging
NAMESPACE=sa-demo 
KOLD=$KUBECONFIG
export KUBECONFIG=~/.kube/config.$CLUSTER
mkdir -p $(dirname $KUBECONFIG)
kanopy-oidc kube setup $CLUSTER > $KUBECONFIG
kanopy-oidc kube login
kubectl config set-context $(kubectl config current-context) --namespace=$NAMESPACE
export KUBECONFIG=$KOLD

KUBECONFIG=~/.kube/config.staging kubectl get pods
kubectl get pods



