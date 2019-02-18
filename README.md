# Pods dependecies init container

This container is used as an init container. It will check if at least one pod for each given label is running in the current namespace.

## Prerequisites

For an optimal use of this init container, other pods must have readiness probe to doesn't allow routing from their services.

## How to use it

The docker image is hosted on docker hub and can be found here:
https://hub.docker.com/r/axelpereira/pods-dependencies-init-container

## How it works

With a set of differents labels, this container will retrieve one pod per given labels which is in the `Running` phase.
Then it will check if all containers inside these pods are ready. If a container is not ready, it's mean that a readiness probe is not fully ended successfully, so the init container will wait at least a new loop to end.

### Settings

| Environment Variable | Required | Default | Description |
| --- | --- | --- | --- |
| POD_LABELS | Yes | - | This is comma (,) seperated string for labels of dependency pods which will be check of `Running` phase. If you want multiple label to check you must seperate with a semicolon (;). |
| MAX_RETRY | NO | 5 | Maximum number of times for which init container will try to check if any pod with give `POD_LABELS` is `Running`. |
| RETRY_TIME_OUT | NO | 1500 | Number of milliseconds init container will time out between each retry. |
| INITIAL_DELAY | NO | 1500 | Number of milliseconds init container will time out before launch the first check. |

Example usage:
```yaml
spec:
  containers:
  ...
  serviceAccountName: {{ .Values.serviceAccount }} #optional
  initContainers:
  - name: pod-dependency
    image: axelpereira/pods-dependencies-init-container:1.0
    env:
    - name: POD_LABELS
      value: app=nodeapp,name=mongo-1;app=javaapp,name=billing-1
    - name: MAX_RETRY
      value: "10"
    - name: RETRY_TIME_OUT
      value: "5000"
    - name: INITIAL_DELAY
      value: "30"
    - name: KUBE_NAMESPACE
      valueFrom:
        fieldRef:
          fieldPath: metadata.namespace```

## RBAC
In case of RBAC this container requires `pods` resource `get`, `list`, `watch` access. Which can be provided by below yaml
```yaml
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: {{ .Values.serviceAccount }}
rules:
  - apiGroups:
      - ""
    resources:
      - pods
      - services
      - endpoints
    verbs:
      - get
      - list
      - watch
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ .Values.serviceAccount }}
  namespace: {{ .Values.namespace }}
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: system:serviceaccount:{{ .Values.serviceAccount }}:default
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: {{ .Values.serviceAccount }}
subjects:
- kind: ServiceAccount
  name: {{ .Values.serviceAccount }}
  namespace: {{ .Values.namespace }}
```
