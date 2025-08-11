
data "aws_availability_zones" "available" {
  state = "available"

  dynamic "filter" {
    for_each = var.aws_region == "us-west-2" ? [1] : []
    content {
      name   = "zone-name"
      values = ["us-west-2a", "us-west-2b", "us-west-2c", "us-west-2d"]
    }
  }
}

# VPC Configuration
resource "aws_vpc" "eks_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${local.cluster_name}-eks-vpc"
  }

}

resource "aws_subnet" "eks_subnet" {
  count                   = 2
  vpc_id                  = aws_vpc.eks_vpc.id
  cidr_block              = element(["10.0.1.0/24", "10.0.2.0/24"], count.index)
  availability_zone       = element(data.aws_availability_zones.available.names, count.index)
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.cluster_name}-eks-subnet-${count.index}"
    "kubernetes.io/role/elb" = "1"
  }

  depends_on = [ 
    aws_vpc.eks_vpc 
  ]
}

resource "aws_internet_gateway" "eks_igw" {
  vpc_id = aws_vpc.eks_vpc.id

  tags = {
    Name = "${local.cluster_name}-eks-igw"
  }

  depends_on = [ 
    aws_vpc.eks_vpc 
  ]
}

resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.eks_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.eks_igw.id
  }

  tags = {
    Name = "${local.cluster_name}-eks-public-rt"
  }

  depends_on = [ 
    aws_vpc.eks_vpc,
    aws_internet_gateway.eks_igw
  ]
}

resource "aws_route_table_association" "rt_assoc" {
  count = 2
  subnet_id      = element(aws_subnet.eks_subnet.*.id, count.index)
  route_table_id = aws_route_table.rt.id

  depends_on = [ 
    aws_route_table.rt,
    aws_subnet.eks_subnet
  ]
}

# Create security groups
resource "aws_security_group" "eks_sg" {
  vpc_id = aws_vpc.eks_vpc.id

  egress {
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 53
    to_port     = 53
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.cluster_name}-eks-sg"
  }

  depends_on = [ 
    aws_vpc.eks_vpc 
  ]
}
