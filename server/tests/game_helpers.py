async def play_game(auth_client_seed):
    game = (await auth_client_seed.get("/games")).json()

    teams = (await auth_client_seed.get("/teams")).json()["teams"]

    roles = set()
    ids = [game["team_1_id"], game["team_2_id"], game["team_3_id"], game["team_4_id"]]
    players = []
    for id in ids:
        for p in teams[id - 1]["players"]:
            if p["role"] not in roles:
                roles.add(p["role"])
                p["igl"] = False
                players.append(p)
                break

    igl = teams[game["team_5_id"] - 1]["players"][-1]
    igl["igl"] = True
    players.append(igl)
    jsn = {
        "game_id": game["id"],
        "player_1": players[0],
        "player_2": players[1],
        "player_3": players[2],
        "player_4": players[3],
        "player_5": players[4],
    }

    return jsn


async def play_game_switch_team(auth_client_seed):
    game = (await auth_client_seed.get("/games")).json()

    teams = (await auth_client_seed.get("/teams")).json()["teams"]

    roles = set()
    ids = [game["team_1_id"], game["team_2_id"], game["team_3_id"], game["team_4_id"]]
    players = []
    for id in ids:
        for p in teams[id - 1]["players"]:
            if p["role"] not in roles:
                roles.add(p["role"])
                p["igl"] = False
                players.append(p)
                break

    igl = teams[game["team_5_id"] - 2]["players"][-1]
    igl["igl"] = True
    players.append(igl)
    jsn = {
        "game_id": game["id"],
        "player_1": players[0],
        "player_2": players[1],
        "player_3": players[2],
        "player_4": players[3],
        "player_5": players[4],
    }

    return jsn


async def play_game_multi_igl(auth_client_seed):
    game = (await auth_client_seed.get("/games")).json()

    teams = (await auth_client_seed.get("/teams")).json()["teams"]

    roles = set()
    ids = [game["team_1_id"], game["team_2_id"], game["team_3_id"], game["team_4_id"]]
    players = []
    for id in ids:
        for p in teams[id - 1]["players"]:
            if p["role"] not in roles:
                roles.add(p["role"])
                p["igl"] = True
                players.append(p)
                break
    igl = teams[game["team_5_id"] - 1]["players"][-1]
    igl["igl"] = True
    players.append(igl)

    jsn = {
        "game_id": game["id"],
        "player_1": players[0],
        "player_2": players[1],
        "player_3": players[2],
        "player_4": players[3],
        "player_5": players[4],
    }

    return jsn
