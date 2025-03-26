#!/bin/sh
echo "Running as user: $(whoami)"

echo "Installing nfs-utils..."
if yum install -y nfs-utils; then
  echo "nfs-utils installed successfully."
else
  echo "Failed to install nfs-utils."
  exit 1
fi

mkdir -p /mnt/efs

efs="${aws_efs_id}.efs.${aws_region}.amazonaws.com"
echo "EFS Address: $efs"
if ! grep -qs '/mnt/efs ' /proc/mounts; then
    echo "Mounting EFS..."
    mount -t nfs4 -o nfsvers=4.1 "$efs:/" /mnt/efs
    if [ $? -eq 0 ]; then
        echo "EFS mounted successfully."
    else
        echo "Failed to mount EFS."
        exit 1
    fi
else
    echo "EFS is already mounted."
fi

echo "Creating user directories..."
for user_id in ${user_ids}; do
  truncated_user_id=$(echo "mdb-openvscode-$user_id" | cut -c1-53)
  echo "Creating directory for user ID: $truncated_user_id"
  mkdir -p /mnt/efs/$truncated_user_id
  if [ $? -eq 0 ]; then
    echo "Directory /mnt/efs/$truncated_user_id created successfully."
  else
    echo "Failed to create directory /mnt/efs/$truncated_user_id."
  fi
done

echo "Script execution completed."