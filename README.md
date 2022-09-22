# Albion Market

## Deploying

The repository is already set up for deploy to kubernetes. 

From a fresh install, add a new file to the root of the project:

```
clear-values.yaml
```

(Copy clear-values.yaml.example to get a head start)

Configure this file with your secret settings.

Run the following to generate a secret key and encrypt your settings.

```
werf helm secret generate-secret-key | tr -d '\n' >  .werf_secret_key
werf helm secret values encrypt clear-values.yaml -o .helm/secret-values.yaml
```

Set the following two secrets on your github repo:

Secret Name|Description
---|---
WERF_SECRET_KEY|The contents of .werf_secret_key in the root of your project
KUBE_CONFIG_BASE64_DATA|The output of `doctl kubernetes cluster kubeconfig show <config name> | base64` if using digital ocean

If you have the Github and Digital Ocean CLIs installed you can do this as follows:

```
gh secret set WERF_SECRET_KEY --repos=\"$(git remote get-url origin)\" < .werf_secret_key
gh secret set KUBE_CONFIG_BASE64_DATA --repos=\"$(git remote get-url origin)\" -b$(doctl kubernetes cluster kubeconfig show ekp | base64)
```

Commit your changes and push to `main` branch. The github action in this repo will perform the deploy with werf.

