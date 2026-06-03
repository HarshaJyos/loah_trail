import re

# Extract CSS design system values from Frame132
with open('c:/Users/Harsha/Documents/Hanish/LOAH_ALWAYS/scratch/extracted2/src/Frame132/Frame132.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Extract all CSS rule blocks
blocks = re.findall(r'(\.frame-132[^{]*)\{([^}]+)\}', css, re.DOTALL)

# Key elements to inspect
targets = [
    'loah-dashboard', 'header', '.nav-bar', 'edit-layout-nav-bar', 
    'note-card', 'frame-98', 'frame-95', '.frame-24', 'frame-7 ',
    'frame-8 ', 'frame-9 ', 'frame-10 ', 'nav-bar4', 'nav-bar2',
    'activity-level', 'hero', 'header-notes', 'header-edit-notes'
]

print('=== KEY STYLE BLOCKS FROM FRAME132.CSS ===\n')
for selector, body in blocks:
    for t in targets:
        if t in selector:
            lines = [l.strip() for l in body.strip().split('\n') if l.strip()]
            print(f'{selector.strip()} {{')
            for l in lines:
                print(f'  {l}')
            print('}\n')
            break

# Also extract colors
print('\n=== UNIQUE COLORS ===')
colors = sorted(set(re.findall(r'(?:color|background|border-color):\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))', css)))
for c in colors:
    print(f'  {c}')

print('\n=== UNIQUE SHADOWS ===')
shadows = sorted(set(re.findall(r'box-shadow:\s*([^;]+);', css)))
for s in shadows:
    print(f'  {s.strip()}')

print('\n=== UNIQUE BORDER-RADIUS ===')
radii = sorted(set(re.findall(r'border-radius:\s*([^;]+);', css)))
for r in radii:
    print(f'  {r.strip()}')
