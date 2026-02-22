# ── OCI authentication ──────────────────────────────────
variable "tenancy_ocid" {
  description = "OCID of your OCI tenancy."
  type        = string
}

variable "user_ocid" {
  description = "OCID of the OCI user with API access."
  type        = string
}

variable "api_key_fingerprint" {
  description = "Fingerprint of the API signing key."
  type        = string
}

variable "api_key_path" {
  description = "Path to the PEM private key for OCI API auth."
  type        = string
  default     = "~/.oci/oci_api_key.pem"
}

variable "region" {
  description = "OCI region identifier."
  type        = string
  default     = "uk-london-1"
}

# ── Compartment ─────────────────────────────────────────
variable "compartment_ocid" {
  description = "OCID of the compartment to create resources in. Use tenancy root if no child compartment."
  type        = string
}

# ── Compute ─────────────────────────────────────────────
variable "instance_shape" {
  description = "OCI VM shape."
  type        = string
  default     = "VM.Standard.E5.Flex"
}

variable "instance_ocpus" {
  description = "Number of OCPUs for the flex shape."
  type        = number
  default     = 1
}

variable "instance_memory_gb" {
  description = "RAM in GB for the flex shape."
  type        = number
  default     = 12
}

variable "instance_display_name" {
  description = "Display name for the VM instance."
  type        = string
  default     = "sacut-cv-web-vm1"
}

# ── Network ─────────────────────────────────────────────
variable "vcn_cidr" {
  description = "CIDR block for the VCN."
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "CIDR block for the public subnet."
  type        = string
  default     = "10.0.1.0/24"
}

# ── SSH ─────────────────────────────────────────────────
variable "ssh_public_key_path" {
  description = "Path to the SSH public key to inject into the instance."
  type        = string
  default     = "~/.ssh/sacut-cv-web-ssh.pub"
}
