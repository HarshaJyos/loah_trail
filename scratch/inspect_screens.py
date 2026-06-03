import re

with open('c:/Users/Harsha/Documents/Hanish/LOAH_ALWAYS/scratch/extracted/src/Frame133/Frame133.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all occurrences of className="..." or className={...}
classes = re.findall(r'className="([^"]+)"', content)
classes += re.findall(r"className='([^']+)'", content)
classes += re.findall(r'className=\{\s*"([^"]+)"', content)

loah_classes = sorted(list(set([c for c in classes if 'loah' in c or 'frame' in c or 'header' in c])))
print("Found class names:")
for c in loah_classes:
    if 'loah' in c or 'screen' in c:
        print("  -", c)

# Let's search specifically for the elements like <div className="..." that are direct children of loah-screens or similar
lines = content.split('\n')
for idx, line in enumerate(lines):
    if 'className="loah-' in line or 'className={"loah-' in line or 'className="dashboard-' in line or 'className="notes-module-' in line or 'className="journal-module-' in line or 'className="routines-module-' in line or 'className="tasks-module-' in line or 'className="habits-module-' in line or 'className="calendar-module-' in line or 'className="trash-' in line:
        print(f"Line {idx+1}: {line.strip()}")
