import random, math
import pandas as pd

DATASET_PATH = "Mumbai_TSP_Dataset.csv"
SOURCE_ID = 50

def calculate_distance(point1, point2):
    lat1, lon1 = map(math.radians, point1)
    lat2, lon2 = map(math.radians, point2)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = (math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2)
    return 6371 * 2 * math.atan2(math.sqrt(a),math.sqrt(1 - a))

def load_dataset():
    df = pd.read_csv(DATASET_PATH)
    required_columns = ["ID","Location","Latitude","Longitude"]
    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]
    if missing_columns:
        raise ValueError("Dataset is missing required columns: " + ", ".join(missing_columns))
    return df

def generate_cities(number):
    df = load_dataset()
    source_row = df[df["ID"] == SOURCE_ID]
    if source_row.empty:
        raise ValueError(f"Source ID {SOURCE_ID} was not found in the dataset.")

    available_locations = df[df["ID"] != SOURCE_ID]
    if number < 2 or number > len(available_locations):
        raise ValueError(
            f"Number of cities must be between 2 and "
            f"{len(available_locations)}."
        )
    source = source_row.iloc[0]
    cities = {
        "SOURCE": (
            float(source["Latitude"]),
            float(source["Longitude"])
        )
    }
    selected = available_locations.sample(n=number,random_state=random.randint(1, 100000))

    for _, row in selected.iterrows():
        cities[str(row["Location"])] = (
            float(row["Latitude"]),
            float(row["Longitude"])
        )
    return cities

def create_distance_matrix(cities):
    matrix = {}
    for city1 in cities:
        matrix[city1] = {}
        for city2 in cities:
            if city1 == city2:
                matrix[city1][city2] = 0
            else:
                matrix[city1][city2] = calculate_distance(cities[city1],cities[city2])
    return matrix

def create_route(cities):
    nodes = [
        city
        for city in cities
        if city != "SOURCE"
    ]
    random.shuffle(nodes)
    return ["SOURCE"] + nodes + ["SOURCE"]

def route_distance(route, matrix):
    total_distance = 0
    for i in range(len(route) - 1):
        total_distance += matrix[route[i]][route[i + 1]]
    return total_distance

def route_fitness(route, matrix):
    return route_distance(route,matrix)

def crossover(parent1, parent2):
    cities1 = parent1[1:-1]
    cities2 = parent2[1:-1]
    if len(cities1) < 2:
        return parent1[:]

    start, end = sorted(random.sample(range(len(cities1)),2))
    child = [None] * len(cities1)
    child[start:end] = cities1[start:end]
    remaining = [
        city
        for city in cities2
        if city not in child
    ]
    index = 0
    for i in range(len(child)):
        if child[i] is None:
            child[i] = remaining[index]
            index += 1

    return ["SOURCE"] + child + ["SOURCE"]

def mutate(route):
    new_route = route[:]
    if len(new_route) > 4:
        i, j = random.sample(range(1,len(new_route) - 1),2)
        new_route[i], new_route[j] = (new_route[j],new_route[i])
    return new_route

def get_neighbor(route):
    return mutate(route)

def aco_solution(nodes, pheromone, matrix):
    unvisited = [
        node
        for node in nodes
        if node != "SOURCE"
    ]
    route = ["SOURCE"]
    current = "SOURCE"
    while unvisited:
        weights = []
        for city in unvisited:
            pheromone_value = pheromone.get((current,city),1.0)
            distance = matrix[current][city]
            weight = pheromone_value / (distance + 1e-10)
            weights.append(weight)

        if sum(weights) <= 0:
            next_city = random.choice(unvisited)
        else:
            next_city = random.choices(unvisited,weights=weights,k=1)[0]

        route.append(next_city)
        unvisited.remove(next_city)
        current = next_city
    route.append("SOURCE")
    return route

def get_problem_info():
    return {
        "name": "Routing Optimization",
        "objective": (
            "Find the shortest route visiting all "
            "selected cities and returning to SOURCE."
        ),
        "input": (
            "Number of cities selected from the "
            "Mumbai TSP dataset."
        ),
        "source": (f"Dataset ID {SOURCE_ID}"
        ),
        "fitness": "Total route distance in kilometres.",
        "goal": "Minimize distance."
    }