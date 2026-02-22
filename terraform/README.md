# Terraform — Oracle Cloud Infrastructure

Infrastructure-as-code for the k3s node that hosts the live CV website.

## What it provisions

| Resource            | Detail                                     |
| ------------------- | ------------------------------------------ |
| VCN + public subnet | 10.0.0.0/16, internet gateway, route table |
| Security list       | Ports 22, 80, 443, 6443 open inbound       |
| Compute instance    | VM.Standard.E5.Flex — 1 OCPU, 12 GB RAM    |
| Reserved public IP  | Static IP attached to the instance         |
| OS                  | Ubuntu 24.04                               |
| SSH key             | Injected at creation                       |

Everything runs on Oracle Cloud's Always Free tier — **£0/month**.

## Prerequisites

1. [Terraform CLI](https://developer.hashicorp.com/terraform/install) ≥ 1.5
2. An OCI account with an [API signing key](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm) configured
3. Your tenancy, user, and compartment OCIDs (found in the OCI Console under Identity)

## Usage

```bash
cd terraform

# 1. Create your variable file from the example
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your OCIDs and key path

# 2. Initialise and apply
terraform init
terraform plan     # review what will be created
terraform apply    # provision the infrastructure

# 3. Connect
ssh -i ~/.ssh/sacut-cv-web-ssh ubuntu@<public_ip>
```

## After provisioning

Once the VM is running, install k3s:

```bash
curl -sfL https://get.k3s.io | sh -
```

The kubeconfig lives at `/etc/rancher/k3s/k3s.yaml` — copy it (with the public IP swapped in) to a GitHub Actions secret for CI/CD deployment.

## Teardown

```bash
terraform destroy
```
