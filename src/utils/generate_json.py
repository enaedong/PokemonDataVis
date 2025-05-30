import requests
import json
import os
import re

def normalize_name(name: str) -> str:
    # Smogon usage file uses dashes, lowercase, no dots/apostrophes
    return name.lower().replace(" ", "-").replace(".", "").replace("'", "")

def extract_pokemon_info(data_text):
    # Split on +----...+ lines to get blocks
    blocks = re.split(r'\+[-]+\+', data_text)
    pokemon_data = {}

    # Build mapping: Pokémon name -> list of section blocks
    for i in range(len(blocks)):
        block = blocks[i].strip()
        # Pokémon name block: single line, starts and ends with |
        if block.startswith('|') and block.endswith('|') and len(block.splitlines()) == 1:
            pokemon_name = block.strip('|').strip()
            # Collect subsequent blocks until next name or end
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
        ability = None
        item = None

        for section in sections:
            lines = section.splitlines()
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

            elif section.startswith('| Abilities') or section.startswith('|Abilities'):
                for line in lines[1:]:
                    line = line.strip().strip('|').strip()
                    if line.endswith('%'):
                        parts = line.rsplit(' ', 1)
                        if len(parts) == 2:
                            ability_name, _ = parts
                            ability = ability_name
                            break  # take only the most used one

            elif section.startswith('| Items') or section.startswith('|Items'):
                for line in lines[1:]:
                    line = line.strip().strip('|').strip()
                    if line.endswith('%'):
                        parts = line.rsplit(' ', 1)
                        if len(parts) == 2:
                            item_name, _ = parts
                            item = item_name
                            break  # take only the most used one

        normalized_name = normalize_name(pokemon_name)
        all_info[normalized_name] = {
            "moves": moves,
            "ability": ability,
            "item": item
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
                ability = info.get("ability", None)
                item = info.get("item", None)
                usage_data.append({
                    "rank": rank,
                    "name": name,
                    "safe_name": safe_name,
                    "usage": round(usage, 1),
                    "ability": ability,
                    "item": item,
                    "moves": moves
                })

        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(usage_data, f, indent=2)

        print(f"JSON file created: {output_file}")

    except requests.RequestException as e:
        print(f"Error fetching stats: {e}")

if __name__ == "__main__":
    generate_usage_json()
