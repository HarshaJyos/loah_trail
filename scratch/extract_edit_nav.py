import re

with open('c:/Users/Harsha/Documents/Hanish/LOAH_ALWAYS/scratch/extracted/src/Frame133/Frame133.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Regular expression to extract CSS blocks
blocks = re.findall(r'(\.[a-zA-Z0-9_-]+[^{]*)\{([^}]+)\}', css_content)

for selector, body in blocks:
    if 'edit-layout-nav-bar' in selector:
        print(f"{selector} {{")
        for line in body.split('\n'):
            print(f"  {line.strip()}")
        print("}")
