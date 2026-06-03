import re

with open('c:/Users/Harsha/Documents/Hanish/LOAH_ALWAYS/scratch/extracted/src/Frame133/Frame133.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Helper to find unique patterns
def find_unique(pattern, text):
    matches = re.findall(pattern, text)
    return sorted(list(set(matches)))

backgrounds = find_unique(r'background:\s*([^;]+);', css_content)
background_colors = find_unique(r'background-color:\s*([^;]+);', css_content)
colors = find_unique(r'color:\s*([^;]+);', css_content)
shadows = find_unique(r'box-shadow:\s*([^;]+);', css_content)
border_colors = find_unique(r'border-color:\s*([^;]+);', css_content)
border_radius = find_unique(r'border-radius:\s*([^;]+);', css_content)
font_families = find_unique(r'font-family:\s*([^;]+);', css_content)

print("=== DESIGN SYSTEM METRICS FROM FIGMA CSS ===")
print("\n--- Backgrounds & Colors ---")
print("Unique Backgrounds:", backgrounds[:25])
print("Unique Background Colors:", background_colors[:25])
print("Unique Colors:", colors[:25])
print("Unique Border Colors:", border_colors[:25])

print("\n--- Shadows ---")
for s in shadows:
    print("  -", s)

print("\n--- Border Radii ---")
for r in border_radius:
    print("  -", r)

print("\n--- Font Families ---")
for f in font_families:
    print("  -", f)
