import re

lines = [
    ' | Leftovers 14.346%                      | ',
    ' | Life Orb 13.266%                       | ',
    ' | Assault Vest 12.812%                   | ',
    ' | Clear Amulet  7.228%                   | ',
    ' | Safety Goggles  7.228%                 | ',
    ' | Other  0.007%                          |'
]

items = {}

for line in lines:
    print(f"🔍 Raw line: '{line}'")
    line = line.strip()
    line = line[1:-1].strip() if line.startswith('|') and line.endswith('|') else line
    print(f"➡️ Cleaned line: '{line}'")
    if not line or 'Other' in line or not line.endswith('%'):
        continue
    match = re.match(r'^(.*?)\s+(\d+\.\d+)%$', line)
    if match:
        item_name = match.group(1).strip()
        percent = float(match.group(2))
        if percent > 10:
            print(f"✅ Parsed: {item_name} = {percent}%")
            items[item_name] = round(percent, 3)
    else:
        print(f"❌ No match for: '{line}'")

print("\n✅ Final items dictionary:", items)
