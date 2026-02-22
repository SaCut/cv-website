# Terraform — Oracle Cloud Infrastructure

IaC for the k3s node backing the live site. Provisions the full network stack, compute instance, and a reserved public IP on Oracle Cloud's Always Free tier.

## Resources

| Resource            | Detail                                     |
| ------------------- | ------------------------------------------ |
| VCN + public subnet | 10.0.0.0/16, internet gateway, route table |
| Security list       | Inbound: 22, 80, 443, 6443                 |
| Compute instance    | VM.Standard.E5.Flex — 1 OCPU, 12 GB RAM    |
| Reserved public IP  | Static — survives instance stop/start      |
| OS                  | Ubuntu 24.04                               |

Running cost: **£0/month** (Oracle Always Free tier).

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- OCI account with an [API signing key](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm)
- Tenancy, user, and compartment OCIDs (OCI Console > Identity)

A dev container is provided at `/.devcontainer` with Terraform pre-installed if you prefer not to install it on your host.

## Usage

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Fill in terraform.tfvars with your OCIDs and key path

terraform init
terraform plan
terraform apply
```

The `terraform.tfvars` file is gitignored. Never commit it.

## CI

The `terraform.yml` workflow runs `fmt --check` and `validate` on every push or PR that touches `terraform/`. No credentials or state backend required — validation only.

## Teardown

```bash
terraform destroy
```
