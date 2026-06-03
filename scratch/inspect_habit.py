with open('c:/Users/Harsha/Documents/Hanish/LOAH_ALWAYS/components/modules/HabitModule.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'router' in line or 'push(' in line or 'new' in line.lower() or 'edit' in line.lower():
        print(f"Line {idx+1}: {line.strip()}")
