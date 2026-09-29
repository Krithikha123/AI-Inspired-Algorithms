import random


def optimize(
    nodes,
    construct_solution,
    fitness_function,
    ants=20,
    iterations=100,
    evaporation=0.5,
    initial_pheromone=1.0,
    maximize=False
):
    pheromone = {
        (i, j): initial_pheromone
        for i in nodes
        for j in nodes
        if i != j
    }

    best_solution = None
    best_fitness = None
    convergence = []
    working = []

    def is_better(a, b):
        if b is None:
            return True
        return a > b if maximize else a < b

    for iteration in range(iterations):
        solutions = []

        for _ in range(ants):
            solution = construct_solution(nodes,pheromone)
            fitness = fitness_function(solution)
            solutions.append((solution, fitness))

            if is_better(fitness, best_fitness):
                best_solution = solution[:]
                best_fitness = fitness

        pheromone_before_evaporation = (
            sum(pheromone.values()) / len(pheromone)
            if pheromone else 0.0
        )

        for edge in pheromone:
            pheromone[edge] *= (1 - evaporation)

        pheromone_level = (
            sum(pheromone.values()) / len(pheromone)
            if pheromone else 0.0
        )

        for solution, fitness in solutions:
            deposit = 1 / (fitness + 1e-10)

            for i in range(len(solution) - 1):
                a = solution[i]
                b = solution[i + 1]

                if (a, b) in pheromone:
                    pheromone[(a, b)] += deposit

        convergence.append(best_fitness)
        working.append({
            "step": iteration + 1,
            "best_fitness": round(float(best_fitness), 4),
            "pheromone_level": round(float(pheromone_level), 6),
            "detail": (
                f"Pheromone Level = {pheromone_before_evaporation:.6f} "
                f"→ {pheromone_level:.6f}"
            )
        })

    return {
        "best_solution": best_solution,
        "best_fitness": best_fitness,
        "convergence": convergence,
        "working": working
    }