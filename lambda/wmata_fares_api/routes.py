import heapq

from .data import Metro

# Not a real walk time: WMATA's times leave transfers out, and this keeps routes off needless changes.
TRANSFER_MINUTES = 5

_orders: dict[int, dict[str, list[str]]] = {}


def _props(metro: Metro) -> dict[str, dict]:
    return {f["properties"]["Code"]: f["properties"] for f in metro.stations["features"]}


def _lines(props: dict) -> list[str]:
    return [line for i in range(1, 5) if (line := props.get(f"LineCode{i}"))]


def _trip(metro: Metro, a: str, b: str) -> tuple[int, float]:
    if a == b:
        return 0, 0.0
    fare = metro.fares[a][b]
    return fare["RailTime"], fare["CompositeMiles"]


def line_orders(metro: Metro) -> dict[str, list[str]]:
    """Each line's platform codes end to end. The data has no order, and sorting by time from one
    end breaks where another line is faster (Blue to L'Enfant Plaza via Yellow), so this walks to
    the nearest unvisited station one hop at a time."""
    if id(metro) in _orders:
        return _orders[id(metro)]
    by_line: dict[str, list[str]] = {}
    for code, props in _props(metro).items():
        for line in _lines(props):
            by_line.setdefault(line, []).append(code)

    orders = {}
    for line, codes in by_line.items():
        far = max(codes, key=lambda c: _trip(metro, codes[0], c))
        end = max(codes, key=lambda c: _trip(metro, far, c))
        order, left = [end], set(codes) - {end}
        while left:
            order.append(min(left, key=lambda c: (_trip(metro, order[-1], c), c)))
            left.remove(order[-1])
        orders[line] = order
    _orders[id(metro)] = orders
    return orders


def _contiguous(order: list[str], stations: list[str]) -> bool:
    if not all(s in order for s in stations):
        return False
    idx = [order.index(s) for s in stations]
    step = 1 if idx[-1] > idx[0] else -1
    return idx == list(range(idx[0], idx[-1] + step, step))


def _toward(order: list[str], stations: list[str]) -> str:
    return order[-1] if order.index(stations[-1]) > order.index(stations[0]) else order[0]


def route(metro: Metro, origin: str, dest: str) -> list[dict]:
    """The fastest legs from origin to dest. A leg rides one stretch of track; `lines` names every
    line that covers it, with the end station it heads toward."""
    props = _props(metro)
    orders = line_orders(metro)

    def together(code: str) -> set[str]:
        return {code, props[code].get("StationTogether1") or code}
    if dest in together(origin):
        return []

    edges: dict[tuple[str, str], list[tuple[int, tuple[str, str]]]] = {}
    for line, order in orders.items():
        for a, b in zip(order, order[1:]):
            minutes = _trip(metro, a, b)[0]
            edges.setdefault((a, line), []).append((minutes, (b, line)))
            edges.setdefault((b, line), []).append((minutes, (a, line)))
    for code in props:
        here = [(c, line) for c in together(code) for line in _lines(props[c])]
        for a in here:
            edges.setdefault(a, []).extend((TRANSFER_MINUTES, b) for b in here if b != a)

    starts = [(c, line) for c in together(origin) for line in _lines(props[c])]
    best = {s: 0 for s in starts}
    came: dict[tuple[str, str], tuple[str, str]] = {}
    queue = [(0, s) for s in starts]
    goal = together(dest)
    while queue:
        cost, state = heapq.heappop(queue)
        if state[0] in goal:
            break
        if cost > best[state]:
            continue
        for minutes, nxt in edges.get(state, []):
            if cost + minutes < best.get(nxt, float("inf")):
                best[nxt], came[nxt] = cost + minutes, state
                heapq.heappush(queue, (cost + minutes, nxt))
    else:
        return []

    path = [state]
    while path[-1] in came:
        path.append(came[path[-1]])
    path.reverse()

    legs: list[list[str]] = []
    for (a, line_a), (b, line_b) in zip(path, path[1:]):
        if line_a == line_b and a != b:
            if legs and legs[-1][-1] == a and legs[-1][0] == line_a:
                legs[-1].append(b)
            else:
                legs.append([line_a, a, b])
    return [
        {
            "stations": stations,
            "lines": [
                {"line": line, "toward": _toward(order, stations)}
                for line, order in orders.items()
                if _contiguous(order, stations)
            ],
        }
        for _, *stations in legs
    ]
