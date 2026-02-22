output "instance_id" {
  description = "OCID of the compute instance."
  value       = oci_core_instance.k3s.id
}

output "public_ip" {
  description = "Reserved public IP of the k3s node."
  value       = oci_core_public_ip.k3s.ip_address
}

output "private_ip" {
  description = "Private IP of the k3s node."
  value       = data.oci_core_vnic.k3s.private_ip_address
}

output "ssh_command" {
  description = "SSH command to connect to the instance."
  value       = "ssh -i ~/.ssh/sacut-cv-web-ssh ubuntu@${oci_core_public_ip.k3s.ip_address}"
}
