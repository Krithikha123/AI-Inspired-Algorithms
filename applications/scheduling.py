import random, time
from algorithms.GA import optimize as ga_optimize
from algorithms.SA import optimize as sa_optimize
from algorithms.ACO import optimize as aco_optimize
from algorithms.PSO import optimize as pso_optimize
from algorithms.ABC import optimize as abc_optimize

def generate_jobs(count):
    jobs = []
    priorities = list(range(1, count + 1))
    random.shuffle(priorities)

    for i in range(1, count + 1):
        jobs.append({
            "id": f"J{i}",
            "processing_time": random.randint(2, 8),
            "priority": priorities[i - 1]
        })
    return jobs

def schedule_fitness(order, jobs):
    job_map = {job["id"]: job for job in jobs}
    current_time = 0
    total_cost = 0

    for job_id in order:
        job = job_map[job_id]
        current_time += job["processing_time"]
        total_cost += current_time * job["priority"]
    return total_cost

def create_solution(jobs):
    order = [job["id"] for job in jobs]
    random.shuffle(order)
    return order

def crossover(parent1, parent2):
    size = len(parent1)
    if size < 2:
        return parent1[:]

    start, end = sorted(random.sample(range(size), 2))
    child = [None] * size
    child[start:end] = parent1[start:end]

    remaining = [
        job for job in parent2
        if job not in child
    ]
    index = 0

    for i in range(size):
        if child[i] is None:
            child[i] = remaining[index]
            index += 1
    return child

def mutate(solution):
    child = solution[:]

    if len(child) > 1:
        i, j = random.sample(range(len(child)), 2)
        child[i], child[j] = child[j], child[i]
    return child

def neighbor(solution):
    return mutate(solution)

def aco_solution(nodes, pheromone):
    remaining = list(nodes)
    solution = []

    while remaining:
        weights = []
        current = solution[-1] if solution else "START"
        for node in remaining:
            value = pheromone.get((current, node),1.0)
            weights.append(value)
        total = sum(weights)

        if total <= 0:
            selected = random.choice(remaining)
        else:
            selected = random.choices(remaining, weights=weights,k=1)[0]
        solution.append(selected)
        remaining.remove(selected)

    return solution

def run_algorithm(algorithm, jobs):
    fitness = lambda solution: schedule_fitness(solution,jobs)
    start_time = time.perf_counter()

    if algorithm == "GA":
        result = ga_optimize(
            fitness_function=fitness,
            create_solution=lambda: create_solution(jobs),
            crossover=crossover,
            mutate=mutate,
            population_size=30,
            generations=100,
            maximize=False
        )

    elif algorithm == "SA":
        result = sa_optimize(
            initial_solution=create_solution(jobs),
            fitness_function=fitness,
            neighbor_function=neighbor,
            initial_temperature=1000,
            cooling_rate=0.95,
            iterations=500,
            maximize=False
        )

    elif algorithm == "ACO":
        nodes = [job["id"] for job in jobs]
        result = aco_optimize(
            nodes=nodes,
            construct_solution=lambda n, p: aco_solution(n,p),
            fitness_function=fitness,
            ants=20,
            iterations=100,
            evaporation=0.5,
            maximize=False
        )

    elif algorithm == "PSO":
        nodes = [job["id"] for job in jobs]

        def decode(position):
            ordered = sorted(zip(position, nodes))
            return [node for _, node in ordered]

        def pso_fitness(position):
            return fitness(decode(position))

        result = pso_optimize(
            dimensions=len(nodes),
            fitness_function=pso_fitness,
            lower_bound=0,
            upper_bound=1,
            particles=30,
            iterations=100,
            inertia=0.7,
            cognitive=1.5,
            social=1.5,
            maximize=False
        )
        result["best_solution"] = decode(result["best_solution"])

    elif algorithm == "ABC":
        result = abc_optimize(
            create_solution=lambda: create_solution(jobs),
            fitness_function=fitness,
            neighbor_function=neighbor,
            bees=30,
            iterations=100,
            limit=20,
            maximize=False
        )

    else:
        raise ValueError("Unknown algorithm")

    execution_time = (time.perf_counter() - start_time)
    order = result["best_solution"]
    job_map = {
        job["id"]: job
        for job in jobs
    }
    current_time = 0
    gantt = []

    for job_id in order:
        duration = job_map[job_id]["processing_time"]
        start = current_time
        current_time += duration

        gantt.append({
            "id": job_id,
            "duration": duration,
            "start": start,
            "end": current_time, 
            "priority": job_map[job_id]["priority"]
        })

    return {
        "algorithm": algorithm,
        "jobs": jobs,
        "schedule": order,
        "fitness": result["best_fitness"],
        "execution_time": execution_time,
        "gantt": gantt,
        "convergence": result.get("convergence", [])
    }