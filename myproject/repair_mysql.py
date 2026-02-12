import os
import shutil
import datetime

mysql_base = r"C:\xampp\mysql"
data_dir = os.path.join(mysql_base, "data")
backup_dir = os.path.join(mysql_base, "backup")

# 1. Create a unique backup name for the current corrupted data
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
corrupted_backup = os.path.join(mysql_base, f"data_corrupted_{timestamp}")

if not os.path.exists(data_dir):
    print(f"Error: {data_dir} does not exist. Cannot repair.")
    exit(1)

print(f"Moving corrupted data to {corrupted_backup}...")
os.rename(data_dir, corrupted_backup)

# 2. Create new data folder
os.makedirs(data_dir)

# 3. Copy everything from backup to data
print("Copying from backup to new data folder...")
for item in os.listdir(backup_dir):
    s = os.path.join(backup_dir, item)
    d = os.path.join(data_dir, item)
    if os.path.isdir(s):
        shutil.copytree(s, d)
    else:
        shutil.copy2(s, d)

# 4. Identify user databases from the corrupted backup
# Excluding system folders
system_folders = {'mysql', 'performance_schema', 'phpmyadmin', 'test'}

print("Restoring user databases...")
for item in os.listdir(corrupted_backup):
    s = os.path.join(corrupted_backup, item)
    d = os.path.join(data_dir, item)
    
    if os.path.isdir(s) and item not in system_folders:
        if os.path.exists(d):
            shutil.rmtree(d)
        shutil.copytree(s, d)
        print(f"  Restored database: {item}")

# 5. Restore ibdata1 metadata file
ibdata_src = os.path.join(corrupted_backup, 'ibdata1')
ibdata_dst = os.path.join(data_dir, 'ibdata1')

if os.path.exists(ibdata_src):
    print("Restoring ibdata1 file...")
    shutil.copy2(ibdata_src, ibdata_dst)
else:
    print("Warning: ibdata1 not found in corrupted backup!")

# 6. Cleanup Aria logs (Crucial for MariaDB startup fixes)
print("Cleaning up potentially corrupted Aria logs...")
aria_files = ['aria_log_control', 'aria_log.00000001']
for f in aria_files:
    target = os.path.join(data_dir, f)
    if os.path.exists(target):
        os.remove(target)
        print(f"  Removed {f}")

print("\nMySQL Repair Complete!")
print(f"Please try starting MySQL from XAMPP Control Panel.")
print(f"Note: Your old corrupted data is at: {corrupted_backup}")
