from pathlib import Path
p = Path("android/app/src/main/AndroidManifest.xml")
if not p.exists():
    raise SystemExit(0)
t = p.read_text()
perms = [
    "android.permission.RECORD_AUDIO",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.POST_NOTIFICATIONS",
    "android.permission.INTERNET",
]
for perm in perms:
    tag = f'    <uses-permission android:name="{perm}" />\n'
    if perm not in t:
        # after <manifest ...>
        idx = t.find(">")
        if idx > 0:
            t = t[: idx + 1] + "\n" + tag + t[idx + 1 :]
p.write_text(t)
print("manifest permissions ok")
