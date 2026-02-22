# ── Data sources ────────────────────────────────────────

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

# Latest Ubuntu 24.04 image for the chosen shape
data "oci_core_images" "ubuntu" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "24.04"
  shape                    = var.instance_shape
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

# ── Networking ──────────────────────────────────────────

resource "oci_core_vcn" "main" {
  compartment_id = var.compartment_ocid
  cidr_blocks    = [var.vcn_cidr]
  display_name   = "cv-website-vcn"
  dns_label      = "cvweb"
}

resource "oci_core_internet_gateway" "igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "cv-website-igw"
  enabled        = true
}

resource "oci_core_route_table" "public" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "cv-website-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.igw.id
  }
}

resource "oci_core_security_list" "public" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "cv-website-seclist"

  # ── Egress: allow all ──
  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
    stateless   = false
  }

  # ── Ingress: SSH (22) ──
  ingress_security_rules {
    protocol  = "6" # TCP
    source    = "0.0.0.0/0"
    stateless = false
    tcp_options {
      min = 22
      max = 22
    }
  }

  # ── Ingress: HTTP (80) ──
  ingress_security_rules {
    protocol  = "6"
    source    = "0.0.0.0/0"
    stateless = false
    tcp_options {
      min = 80
      max = 80
    }
  }

  # ── Ingress: HTTPS (443) ──
  ingress_security_rules {
    protocol  = "6"
    source    = "0.0.0.0/0"
    stateless = false
    tcp_options {
      min = 443
      max = 443
    }
  }

  # ── Ingress: k3s API (6443) ──
  ingress_security_rules {
    protocol  = "6"
    source    = "0.0.0.0/0"
    stateless = false
    tcp_options {
      min = 6443
      max = 6443
    }
  }

  # ── Ingress: ICMP (ping, path discovery) ──
  ingress_security_rules {
    protocol  = "1" # ICMP
    source    = "0.0.0.0/0"
    stateless = false
    icmp_options {
      type = 3
      code = 4
    }
  }
}

resource "oci_core_subnet" "public" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.main.id
  cidr_block        = var.subnet_cidr
  display_name      = "cv-website-public-subnet"
  dns_label         = "pub"
  route_table_id    = oci_core_route_table.public.id
  security_list_ids = [oci_core_security_list.public.id]
}

# ── Compute ─────────────────────────────────────────────

resource "oci_core_instance" "k3s" {
  compartment_id      = var.compartment_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  shape               = var.instance_shape
  display_name        = var.instance_display_name

  shape_config {
    ocpus         = var.instance_ocpus
    memory_in_gbs = var.instance_memory_gb
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu.images[0].id
  }

  create_vnic_details {
    subnet_id                 = oci_core_subnet.public.id
    assign_public_ip          = false # using reserved IP below
    assign_private_dns_record = true
  }

  metadata = {
    ssh_authorized_keys = file(var.ssh_public_key_path)
  }
}

# ── Reserved public IP ──────────────────────────────────

# ── VNIC lookup (needed for IP assignment + outputs) ────

data "oci_core_vnic_attachments" "k3s" {
  compartment_id = var.compartment_ocid
  instance_id    = oci_core_instance.k3s.id
}

data "oci_core_vnic" "k3s" {
  vnic_id = data.oci_core_vnic_attachments.k3s.vnic_attachments[0].vnic_id
}

data "oci_core_private_ips" "k3s" {
  vnic_id = data.oci_core_vnic.k3s.id
}

# ── Reserved public IP ──────────────────────────────────

resource "oci_core_public_ip" "k3s" {
  compartment_id = var.compartment_ocid
  lifetime       = "RESERVED"
  display_name   = "cv-website-k3s-ip"
  private_ip_id  = data.oci_core_private_ips.k3s.private_ips[0].id
}
