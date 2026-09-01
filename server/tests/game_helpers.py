async def play_game(auth_client_seed):
    game = (await auth_client_seed.post("/games")).json()

    teams = (await auth_client_seed.get("/teams")).json()

    roles = set()
    ids = [game["team_1_id"], game["team_2_id"], game["team_3_id"], game["team_4_id"]]
    players = []
    for id in ids:
        for p in teams[str(id)]["players"]:
            if p["role"] not in roles:
                roles.add(p["role"])
                players.append(p)
                break

    last = teams[str(game["team_5_id"])]["players"][-1]
    players.append(last)

    return {
        "game_id": game["id"],
        "player_1": players[0],
        "player_2": players[1],
        "player_3": players[2],
        "player_4": players[3],
        "player_5": players[4],
        "igl": last["id"],
    }


async def play_game_switch_team(auth_client_seed):
    game = (await auth_client_seed.post("/games")).json()

    teams = (await auth_client_seed.get("/teams")).json()

    roles = set()
    ids = [game["team_1_id"], game["team_2_id"], game["team_3_id"], game["team_4_id"]]
    players = []
    for id in ids:
        for p in teams[str(id)]["players"]:
            if p["role"] not in roles:
                roles.add(p["role"])
                players.append(p)
                break

    id = {1, 2, 3} - {game["team_5_id"], game["team_6_id"]}
    id = str(id.pop())

    last = teams[id]["players"][-1]
    players.append(last)

    return {
        "game_id": game["id"],
        "player_1": players[0],
        "player_2": players[1],
        "player_3": players[2],
        "player_4": players[3],
        "player_5": players[4],
        "igl": last["id"],
    }


async def play_game_wrong_igl(auth_client_seed):
    game = (await auth_client_seed.post("/games")).json()

    teams = (await auth_client_seed.get("/teams")).json()

    roles = set()
    ids = [game["team_1_id"], game["team_2_id"], game["team_3_id"], game["team_4_id"]]
    players = []
    for id in ids:
        for p in teams[str(id)]["players"]:
            if p["role"] not in roles:
                roles.add(p["role"])
                players.append(p)
                break

    last = teams[str(game["team_5_id"])]["players"][-1]
    players.append(last)

    return {
        "game_id": game["id"],
        "player_1": players[0],
        "player_2": players[1],
        "player_3": players[2],
        "player_4": players[3],
        "player_5": players[4],
        "igl": 9999,
    }
