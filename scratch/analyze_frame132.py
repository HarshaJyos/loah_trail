import re

with open('c:/Users/Harsha/Documents/Hanish/LOAH_ALWAYS/scratch/extracted2/src/Frame132/Frame132.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
for idx, line in enumerate(lines):
    stripped = line.strip()
    if any(kw in stripped for kw in ['className="loah-', 'className="dashboard', 'className="notes-module', 
                                      'className="journal-module', 'className="routines-module', 
                                      'className="habits-module', 'className="tasks-module', 
                                      'className="calendar-module', 'className="brain-dump-screens',
                                      'className="habit-screens', 'className="task-screens',
                                      'className="routine-screens', 'className="calendar-screens']):
        print(f'L{idx+1}: {stripped[:150]}')

print('\n--- Total lines:', len(lines))
print('--- Total chars:', len(content))
