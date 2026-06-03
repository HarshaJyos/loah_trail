import os
import re

directories = [
    r"c:\Users\Harsha\Documents\Hanish\LOAH_ALWAYS\components\modules",
    r"c:\Users\Harsha\Documents\Hanish\LOAH_ALWAYS\components\charts",
    r"c:\Users\Harsha\Documents\Hanish\LOAH_ALWAYS\components\editors"
]

replacements = [
    # Backgrounds
    ("bg-[#F5F7FA]", "bg-[var(--bg-canvas)]"),
    ("bg-white", "bg-[var(--bg-surface)]"),
    ("bg-slate-50", "bg-[var(--bg-surface-elevated)]"),
    ("bg-slate-100/50", "bg-[var(--bg-surface-elevated)]"),
    ("bg-slate-100", "bg-[var(--bg-surface-elevated)]"),
    ("bg-slate-200", "bg-[var(--border-subtle)]"),
    ("bg-white/60", "bg-[var(--bg-surface)]"),
    ("bg-white/95", "bg-[var(--bg-surface)]"),
    
    # Hover states
    ("hover:bg-slate-100/70", "hover:bg-[var(--bg-surface-hover)]"),
    ("hover:bg-slate-200/80", "hover:bg-[var(--bg-surface-hover)]"),
    ("hover:bg-slate-100/50", "hover:bg-[var(--bg-surface-hover)]"),
    
    # Borders
    ("border-slate-200/60", "border-[var(--border-subtle)]"),
    ("border-slate-200", "border-[var(--border-default)]"),
    ("border-slate-300", "border-[var(--border-strong)]"),
    
    # Text colors
    ("text-slate-900", "text-[var(--text-primary)]"),
    ("text-slate-800", "text-[var(--text-primary)]"),
    ("text-slate-700", "text-[var(--text-secondary)]"),
    ("text-slate-500", "text-[var(--text-secondary)]"),
    ("text-slate-400", "text-[var(--text-tertiary)]"),
    ("text-slate-600", "text-[var(--text-secondary)]"),
    ("text-zinc-600", "text-[var(--text-secondary)]"),
    
    # Dashboard/Generic hex overrides
    ("#1E1E1E", "var(--text-primary)"),
    ("#F5F7FA", "var(--bg-app)"),
    ("#E2E8F0", "var(--border-subtle)"),
]

for directory in directories:
    if not os.path.exists(directory): continue
    for filename in os.listdir(directory):
        if filename.endswith(".tsx"):
            filepath = os.path.join(directory, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            orig_content = content
            
            for old, new in replacements:
                content = content.replace(old, new)
            
            if content != orig_content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Updated {filename}")
