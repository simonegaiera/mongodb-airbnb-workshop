resource "aws_efs_file_system" "efs" {
  creation_token = "efs-${var.cluster_name}"

  encrypted = true

  tags = {
    Name = "efs-${var.cluster_name}"
  }
}

resource "aws_security_group" "efs_sg" {
  name        = "efs-sg"
  description = "Allow NFS traffic"
  vpc_id      = aws_vpc.eks_vpc.id

  ingress {
    from_port   = 2049
    to_port     = 2049
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  depends_on = [ aws_vpc.eks_vpc ]
}

resource "aws_efs_mount_target" "efs_mt" {
  for_each = { for idx, subnet in aws_subnet.eks_subnet : idx => subnet }
  
  file_system_id  = aws_efs_file_system.efs.id  
  subnet_id       = each.value.id  
  security_groups = [aws_security_group.efs_sg.id]  
  
  depends_on = [   
    aws_efs_file_system.efs,  
    aws_security_group.efs_sg,
    aws_subnet.eks_subnet
  ]  
}


# # Output the EFS File System ID
# output "efs_id" {
#   value = aws_efs_file_system.efs.id
# }
# # Output the EFS Mount Target IDs
# output "efs_mount_target_ids" {
#   value = [for mt in aws_efs_mount_target.efs_mt : mt.id]
# }
