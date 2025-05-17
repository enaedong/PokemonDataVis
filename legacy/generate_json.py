import requests
import json
import os
import re

def normalize_name(name: str) -> str:
    # Smogon usage file uses dashes, lowercase, no dots/apostrophes
    return name.lower().replace(" ", "-").replace(".", "").replace("'", "")

def extract_top_moves(moveset_text):
    # Split on +----...+ lines to get blocks
    blocks = re.split(r'\+[-]+\+', moveset_text)
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

    # Extract top move for each Pokémon
    top_moves = {}
    for pokemon_name, sections in pokemon_data.items():
        moves = {}
        for section in sections:
            if section.startswith('| Moves') or section.startswith('|Moves'):
                lines = section.splitlines()
                for line in lines[1:]:  # skip the header
                    line = line.strip().strip('|').strip()
                    if line.endswith('%'):
                        parts = line.rsplit(' ', 1)
                        if len(parts) == 2:
                            move_name, percent_str = parts
                            try:
                                percent = float(percent_str.strip('%'))
                                moves[move_name] = percent
                            except ValueError:
                                pass
        # Pick the move with the highest percent (excluding "Other")
        if moves:
            moves_no_other = {k: v for k, v in moves.items() if k.lower() != "other"}
            if moves_no_other:
                top_move = max(moves_no_other.items(), key=lambda x: x[1])[0]
            else:
                top_move = max(moves.items(), key=lambda x: x[1])[0]
        else:
            top_move = None
        normalized_name = normalize_name(pokemon_name)
        top_moves[normalized_name] = top_move

    return top_moves

def generate_usage_json(month="2025-04", format="gen9ou-", rating="0", output_file="data/usage.json"):
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
        moveset_text = moveset_response.text

        # Extract top moves from moveset text
        top_moves = extract_top_moves(moveset_text)

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
                top_move = top_moves.get(safe_name, None)
                usage_data.append({
                    "rank": rank,
                    "name": name,
                    "safe_name": safe_name,
                    "usage": round(usage, 1),
                    "top_move": top_move
                })

        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(usage_data, f, indent=2)

        print(f"JSON file created: {output_file}")

    except requests.RequestException as e:
        print(f"Error fetching stats: {e}")

if __name__ == "__main__":
    generate_usage_json()
