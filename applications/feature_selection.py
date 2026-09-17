import random, time
from algorithms.GA import optimize as ga_optimize
from algorithms.SA import optimize as sa_optimize
from algorithms.ACO import optimize as aco_optimize
from algorithms.PSO import optimize as pso_optimize
from algorithms.ABC import optimize as abc_optimize

def generate_features(count):
    features = []
    for i in range(1, count + 1):
        features.append({
            "id": f"F{i}",
            "relevance": round(random.uniform(0.30, 1.00), 2)
        })
    return features

def generate_redundancy_matrix(features):
    size = len(features)
    matrix = []
    for i in range(size):
        row = []
        for j in range(size):
            if i == j:
                row.append(0.0)
            elif j < i:
                row.append(matrix[j][i])
            else:
                row.append(round(random.uniform(0.05, 0.90), 2))
        matrix.append(row)
    return matrix

def feature_fitness(solution, features, redundancy_matrix):
    selected_indices = [
        i for i, value in enumerate(solution)
        if value == 1
    ]

    if not selected_indices:
        return -1

    total_features = len(features)

    relevance_score = sum(
        features[i]["relevance"]
        for i in selected_indices
    ) / total_features

    selection_penalty = (
    len(selected_indices) / total_features)
    redundancy_penalty = 0

    for i in range(len(selected_indices)):
        for j in range(i + 1, len(selected_indices)):
            feature_a = selected_indices[i]
            feature_b = selected_indices[j]
            redundancy_penalty += redundancy_matrix[feature_a][feature_b]

    if len(selected_indices) > 1:
        pair_count = (len(selected_indices) * (len(selected_indices) - 1) / 2)
        redundancy_penalty /= pair_count
    return (relevance_score - 0.40 * selection_penalty - 0.50 * redundancy_penalty)

def create_solution(features):
    solution = [
        random.randint(0, 1)
        for _ in features
    ]

    if sum(solution) == 0:
        solution[random.randrange(len(solution))] = 1
    return solution

def mutate(solution):
    child = solution[:]
    if child:
        index = random.randrange(len(child))
        child[index] = 1 - child[index]

    if sum(child) == 0:
        child[random.randrange(len(child))] = 1
    return child

def neighbor(solution):
    return mutate(solution)

def crossover(parent1, parent2):
    if len(parent1) < 2:
        return parent1[:]

    point = random.randint(1, len(parent1) - 1)
    child = parent1[:point] + parent2[point:]

    if sum(child) == 0:
        child[random.randrange(len(child))] = 1

    return child

def aco_solution(nodes, pheromone):
    solution = []
    for node in nodes:
        pheromone_value = pheromone.get(("START", node),1.0)
        probability = (pheromone_value /(pheromone_value + 1.0))
        solution.append(1 if random.random() < probability else 0)

    if sum(solution) == 0:
        solution[random.randrange(len(solution))] = 1

    return solution

def run_algorithm(algorithm, features, redundancy_matrix):
    fitness = lambda solution: feature_fitness(solution,features,redundancy_matrix)
    start_time = time.perf_counter()

    if algorithm == "GA":
        result = ga_optimize(
            fitness_function=fitness,
            create_solution=lambda: create_solution(features),
            crossover=crossover,
            mutate=mutate,
            population_size=20,
            generations=60,
            maximize=True
        )

    elif algorithm == "SA":
        result = sa_optimize(
            initial_solution=create_solution(features),
            fitness_function=fitness,
            neighbor_function=neighbor,
            initial_temperature=100,
            cooling_rate=0.90,
            iterations=250,
            maximize=True
        )

    elif algorithm == "ACO":
        nodes = list(range(len(features)))

        result = aco_optimize(
            nodes=nodes,
            construct_solution=lambda n, p: aco_solution(n, p),
            fitness_function=fitness,
            ants=15,
            iterations=60,
            evaporation=0.50,
            maximize=True
        )

    elif algorithm == "PSO":
        def decode(position):
            solution = [
                1 if value >= 0.5 else 0
                for value in position
            ]
            if sum(solution) == 0:
                solution[random.randrange(len(solution))] = 1
            return solution

        def pso_fitness(position):
            return fitness(decode(position))

        result = pso_optimize(
            dimensions=len(features),
            fitness_function=pso_fitness,
            lower_bound=0,
            upper_bound=1,
            particles=20,
            iterations=60,
            inertia=0.70,
            cognitive=1.5,
            social=1.5,
            maximize=True
        )

        result["best_solution"] = decode(result["best_solution"])

    elif algorithm == "ABC":
        result = abc_optimize(
            create_solution=lambda: create_solution(features),
            fitness_function=fitness,
            neighbor_function=neighbor,
            bees=20,
            iterations=60,
            limit=15,
            maximize=True
        )

    else:
        raise ValueError("Unknown algorithm")

    execution_time = time.perf_counter() - start_time
    selected_features = []

    for index, value in enumerate(result["best_solution"]):
        if value == 1:
            selected_features.append({
                "id": features[index]["id"],
                "relevance": features[index]["relevance"]
            })

    feature_results = []
    for feature in features:
        feature_results.append({
            "id": feature["id"],
            "relevance": feature["relevance"]
        })

    selected_indices = [
        i for i, value in enumerate(result["best_solution"]) if value == 1
    ]

    redundancy_score = 0

    if len(selected_indices) > 1:
        pair_count = (len(selected_indices) * (len(selected_indices) - 1) / 2)
        for i in range(len(selected_indices)):
            for j in range(i + 1, len(selected_indices)):
                redundancy_score += redundancy_matrix[selected_indices[i]][selected_indices[j]]
        redundancy_score /= pair_count

    return {
        "algorithm": algorithm,
        "features": feature_results,
        "selected_features": selected_features,
        "selection_vector": result["best_solution"],
        "fitness": result["best_fitness"],
        "redundancy": round(redundancy_score, 3),
        "execution_time": execution_time,
        "convergence": result.get("convergence", []),
        "reason": (
            f"{len(selected_features)} out of "
            f"{len(features)} features were selected "
            f"based on relevance, subset size and "
            f"redundancy between selected features."
        )
    }