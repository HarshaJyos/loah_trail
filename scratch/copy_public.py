import os
import shutil

src_dir = 'c:/Users/Harsha/Documents/Hanish/LOAH_ALWAYS/scratch/extracted/public'
dst_dir = 'c:/Users/Harsha/Documents/Hanish/LOAH_ALWAYS/public'

if not os.path.exists(dst_dir):
    os.makedirs(dst_dir)
    print(f"Created directory: {dst_dir}")

count = 0
for item in os.listdir(src_dir):
    s = os.path.join(src_dir, item)
    d = os.path.join(dst_dir, item)
    if os.path.isfile(s):
        shutil.copy2(s, d)
        count += 1

print(f"Successfully copied {count} assets to the Next.js public directory.")
