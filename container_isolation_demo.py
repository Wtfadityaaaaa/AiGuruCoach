import os
import subprocess

def create_namespace():
    print("Creating isolated namespace using unshare...")
    subprocess.run(["unshare", "--pid", "--mount-proc", "bash"])

def apply_cgroup_limits():
    print("Setting CPU and Memory limits (simulation)...")
    os.system("echo 100000 > /sys/fs/cgroup/cpu/demo_group/cpu.cfs_quota_us")
    os.system("echo 256M > /sys/fs/cgroup/memory/demo_group/memory.limit_in_bytes")

def main():
    print("=== Container Initialization ===")
    print("Setting up namespaces and resource limits...")
    try:
        create_namespace()
        apply_cgroup_limits()
        print("Executing isolated process (sleep 5)...")
        subprocess.run(["sleep", "5"])
        print("Process executed successfully in isolated environment!")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
