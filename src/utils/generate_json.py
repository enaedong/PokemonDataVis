import requests
import json
import os
import re

def normalize_name(name: str) -> str:
    # Smogon usage file uses dashes, lowercase, no dots/apostrophes
    return name.lower().replace(" ", "-").replace(".", "").replace("'", "")

def extract_pokemon_info(moveset_text):
    import re

    blocks = re.split(r'\+[-]+\+', moveset_text)
    pokemon_data = {}

    # Parse Pokémon blocks
    for i in range(len(blocks)):
        block = blocks[i].strip()
        if block.startswith('|') and block.endswith('|') and len(block.splitlines()) == 1:
            pokemon_name = block.strip('|').strip()
            j = i + 1
            sections = []
            while j < len(blocks):
                next_block = blocks[j].strip()
                if next_block.startswith('|') and next_block.endswith('|') and len(next_block.splitlines()) == 1:
                    break
                sections.append(next_block)
                j += 1
            pokemon_data[pokemon_name] = sections

    all_info = {}
    for pokemon_name, sections in pokemon_data.items():
        moves = {}
        ability = []
        item = None
        spread = None

        for section in sections:
            lines = section.splitlines()

            # Moves used >15%
            if section.startswith('| Moves') or section.startswith('|Moves'):
                for line in lines[1:]:
                    line = line.strip().strip('|').strip()
                    if line.endswith('%'):
                        parts = line.rsplit(' ', 1)
                        if len(parts) == 2:
                            move_name, percent_str = parts
                            if move_name.lower() == "other":
                                continue
                            try:
                                percent = float(percent_str.strip('%'))
                                if percent > 15:
                                    moves[move_name] = percent
                            except ValueError:
                                pass

            # Top ability (most used)
            elif section.startswith('| Abilities') or section.startswith('|Abilities'):
                for line in lines[1:]:
                    line = line.strip()
                    line = line[1:-1].strip() if line.startswith('|') and line.endswith('|') else line
                    if line.endswith('%'):
                        parts = line.rsplit(' ', 1)
                        if len(parts) == 2:
                            ability_name, _ = parts
                            ability.append(ability_name)

            # Items used >10%
            elif section.startswith('| Items') or section.startswith('|Items'):
                for line in lines[1:]:
                    line = line.strip()
                    line = line[1:-1].strip() if line.startswith('|') and line.endswith('|') else line
                    if not line or 'Other' in line or not line.endswith('%'):
                        continue
                    match = re.match(r'^(.*?)\s+(\d+\.\d+)%$', line)
                    if match:
                        item = match.group(1).strip()
                        break
            
            elif section.startswith('| Spreads') or section.startswith('|Spreads'):
                for line in lines[1:]:
                    line = line.strip()
                    line = line[1:-1].strip() if line.startswith('|') and line.endswith('|') else line
                    if not line or 'Other' in line or not line.endswith('%'):
                        continue
                    # Match lines like: Timid:0/0/4/252/0/252 25.999%
                    match = re.match(r'^(\w+):([\d/]+)\s+\d+\.\d+%$', line)
                    if match:
                        nature = match.group(1)
                        evs = match.group(2)
                        spread_str = f'Nature: {nature}, EVs: {evs}'
                        spread = spread_str
                        break  # Only the most used spread

        normalized_name = normalize_name(pokemon_name)
        all_info[normalized_name] = {
            "moves": moves,
            "ability": ability,
            "items": item,
            "spread": spread
        }

    return all_info

def generate_usage_json(month="2025-04", format="gen9bssregi-", rating="1500", output_file="public/usage.json"):
    usage_url = f"https://www.smogon.com/stats/{month}/{format}{rating}.txt"
    moveset_url = f"https://www.smogon.com/stats/{month}/moveset/{format}{rating}.txt"

    try:
        # Fetch usage data
        usage_response = requests.get(usage_url)
        usage_response.raise_for_status()
        usage_lines = usage_response.text.splitlines()

        # Fetch moveset data
        moveset_response = requests.get(moveset_url)
        moveset_response.raise_for_status()
        data_text = moveset_response.text

        # Extract all moves from moveset text
        all_info = extract_pokemon_info(data_text)

        # Parse usage data block
        start_index = None
        for i, line in enumerate(usage_lines):
            if line.strip().startswith("| Rank"):
                start_index = i + 1
                break

        if start_index is None:
            print("Could not find the start of ranking data.")
            return

        usage_data = []
        for line in usage_lines[start_index:]:
            if not line.strip():
                break

            columns = line.split("|")
            if len(columns) >= 4:
                rank = int(columns[1].strip())
                name = columns[2].strip()
                usage = float(columns[3].strip().replace('%', ''))
                safe_name = normalize_name(name)
                info = all_info.get(safe_name, {})
                moves = info.get("moves", {})
                ability = info.get("ability", [])
                item = info.get("items", {})
                spread = info.get("spread", {})
                usage_data.append({
                    "rank": rank,
                    "name": name,
                    "safe_name": safe_name,
                    "usage": round(usage, 1),
                    "ability": ability,
                    "items": item,
                    "moves": moves,
                    "spread": spread
                })

        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(usage_data, f, indent=2)

        print(f"JSON file created: {output_file}")

    except requests.RequestException as e:
        print(f"Error fetching stats: {e}")

if __name__ == "__main__":
    generate_usage_json()
