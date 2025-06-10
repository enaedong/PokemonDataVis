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

def fetch_and_parse_moveset(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return extract_pokemon_info(response.text)  # ⬅️ Your existing function
    except requests.RequestException as e:
        print(f"Error fetching moveset from {url}: {e}")
        return {}

def generate_usage_json(month="2025-05", output_file="public/usage.json"):
    base_url = f"https://www.smogon.com/stats/{month}"
    usage_url = f"{base_url}/gen9bssregi-1500.txt"
    bssregi_moveset_url = f"{base_url}/moveset/gen9bssregi-1500.txt"
    ou_moveset_url = f"{base_url}/moveset/gen9ou-1500.txt"

    try:
        # Fetch moveset data in order of fallback priority
        print("Fetching moveset data...")
        bss_info = fetch_and_parse_moveset(bssregi_moveset_url)
        ou_info = fetch_and_parse_moveset(ou_moveset_url)

        # Fetch usage ranking data from BSSregi
        print("Fetching BSS usage ranking...")
        usage_response = requests.get(usage_url)
        usage_response.raise_for_status()
        usage_lines = usage_response.text.splitlines()

        start_index = None
        for i, line in enumerate(usage_lines):
            if line.strip().startswith("| Rank"):
                start_index = i + 1
                break

        if start_index is None:
            print("Could not find the start of ranking data.")
            return

        usage_data = []
        included_names = set()

        def get_fallback_info(name):
            """Tries to get move data from bss, then ou, then AG."""
            info = bss_info.get(name)
            if info and info.get("moves"):
                return info
            info = ou_info.get(name)
            if info and info.get("moves"):
                return info
            return None

        # 1. From BSSregi usage list
        rank_count = 1
        for line in usage_lines[start_index:]:
            if not line.strip():
                break
            columns = line.split("|")
            if len(columns) >= 4:
                name = columns[2].strip()
                usage = float(columns[3].strip().replace('%', ''))
                safe_name = normalize_name(name)

                info = get_fallback_info(safe_name)
                if not info:
                    continue  # skip Pokémon with no moves in any dataset

                usage_data.append({
                    "rank": rank_count,
                    "name": name,
                    "safe_name": safe_name,
                    "usage": round(usage, 1),
                    "ability": info.get("ability", []),
                    "items": info.get("items", None),
                    "moves": info.get("moves", {}),
                    "spread": info.get("spread", None),
                })
                included_names.add(safe_name)
                rank_count += 1

        print(f"{len(usage_data)} Pokémon from BSSregi usage with valid move data")

        # 2. Append Pokémon not in BSSregi from ou or AG (only if they have moves)
        fallback_names = set(ou_info.keys())

        added_count = 0
        for name in sorted(fallback_names):
            if name in included_names:
                continue
            info = get_fallback_info(name)
            if not info:
                continue  # skip if no usable move data

            usage_data.append({
                "rank": None,
                "name": name.title(),
                "safe_name": name,
                "usage": 0.0,
                "ability": info.get("ability", []),
                "items": info.get("items", None),
                "moves": info.get("moves", {}),
                "spread": info.get("spread", None),
            })
            included_names.add(name)
            added_count += 1

        print(f"Appended {added_count} fallback Pokémon with usable move data")

        # 3. Write final file
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(usage_data, f, indent=2)

        print(f"✅ JSON file created: {output_file}")
        print(f"Total Pokémon: {len(usage_data)}")

    except requests.RequestException as e:
        print(f"Error fetching stats: {e}")

if __name__ == "__main__":
    generate_usage_json()
