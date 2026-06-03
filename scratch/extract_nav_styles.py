import re

with open('c:/Users/Harsha/Documents/Hanish/LOAH_ALWAYS/scratch/extracted/src/Frame133/Frame133.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Regular expression to extract CSS blocks
blocks = re.findall(r'(\.[a-zA-Z0-9_-]+[^{]*)\{([^}]+)\}', css_content)

search_classes = [
    'loah-dashboard', 'header', 'hero', 'frame-7', 'frame-8', 'frame-9', 'frame-10',
    'nav-bar', 'edit-layout-nav-bar', 'note-card', 'brain-dump-card', 'frame-98',
    'frame-93', 'frame-95', 'frame-96', 'ql-toolbar'
]

print("=== FIGMA CSS DECLARATIONS ===")
for selector, body in blocks:
    selector_clean = selector.strip()
    # Check if any search class is in the selector
    if any(cls in selector_clean for cls in search_classes):
        print(f"{selector_clean} {{")
        for line in body.split('\n'):
            if line.strip():
                print(f"  {line.strip()}")
        print("}\n")
