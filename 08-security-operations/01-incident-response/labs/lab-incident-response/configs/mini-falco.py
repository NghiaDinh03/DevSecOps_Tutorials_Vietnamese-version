import os
import time
import sys

print("====================================================")
print("🛡️  MINI-FALCO: RUNTIME SECURITY MONITORING ACTIVATED")
print("====================================================")
print("Đang quét và giám sát sâu các tiến trình inside container...")

MONITORED_PATHS = ['/workspace/app/sensitive_config.json', '/etc/passwd']
SPAWNED_SHELLS = []

# Đọc danh sách tiến trình từ /proc
def get_running_processes():
    processes = []
    for pid_dir in os.listdir('/proc'):
        if pid_dir.isdigit():
            try:
                with open(os.path.join('/proc', pid_dir, 'cmdline'), 'r') as f:
                    cmdline = f.read().replace('\x00', ' ').strip()
                if cmdline:
                    processes.append((pid_dir, cmdline))
            except IOError:
                continue
    return processes

# Lưu giữ trạng thái mtime của các file nhạy cảm để check ghi đè
file_states = {}
for path in MONITORED_PATHS:
    if os.path.exists(path):
        file_states[path] = os.path.getmtime(path)

while True:
    try:
        # 1. Quét phát hiện Shell Spawn
        processes = get_running_processes()
        for pid, cmd in processes:
            # Phát hiện mở shell sh hoặc ash hoặc bash
            if any(shell in cmd for shell in ['sh', 'ash', 'bash']) and 'mini-falco' not in cmd:
                if pid not in SPAWNED_SHELLS:
                    SPAWNED_SHELLS.append(pid)
                    print(f"🚨 ALERT [WARNING] Spawn Shell in Container Detected: PID={pid} CMD='{cmd}'")
                    sys.stdout.flush()

        # 2. Quét phát hiện chỉnh sửa File nhạy cảm
        for path in MONITORED_PATHS:
            if os.path.exists(path):
                current_mtime = os.path.getmtime(path)
                if path in file_states and current_mtime != file_states[path]:
                    file_states[path] = current_mtime
                    print(f"🚨 ALERT [CRITICAL] Sensitive File Written/Modified: File={path}")
                    sys.stdout.flush()
            elif path in file_states:
                # File bị xóa
                print(f"🚨 ALERT [CRITICAL] Sensitive File Deleted: File={path}")
                del file_states[path]
                sys.stdout.flush()

        time.sleep(1) # Quét chu kỳ mỗi 1 giây
    except KeyboardInterrupt:
        print("\nMini-Falco đã tắt.")
        break
