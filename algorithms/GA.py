import random


def optimize(
    fitness_function,
    create_solution,
    crossover,
    mutate,
    population_size=30,
    generations=100,
    maximize=False
):
    population = [
        create_solution()
        for _ in range(population_size)
    ]

    best_solution = None
    best_fitness = None
    convergence = []

    def is_better(a, b):
        if b is None:
            return True
        return a > b if maximize else a < b

    for _ in range(generations):
        fitness_values = [
            fitness_function(solution)
            for solution in population
        ]

        for solution, fitness in zip(population, fitness_values):
            if is_better(fitness, best_fitness):
                best_solution = solution[:]
                best_fitness = fitness

        convergence.append(best_fitness)

        new_population = []

        while len(new_population) < population_size:
            parent1 = tournament_selection(
                population,
                fitness_values,
                maximize
            )

            parent2 = tournament_selection(
                population,
                fitness_values,
                maximize
            )

            child = crossover(parent1, parent2)

            child = mutate(child)

            new_population.append(child)

        population = new_population

    return {
        "best_solution": best_solution,
        "best_fitness": best_fitness,
        "convergence": convergence
    }


def tournament_selection(population, fitness_values, maximize):
    candidates = random.sample(
        range(len(population)),
        min(3, len(population))
    )

    best_index = candidates[0]

    for index in candidates[1:]:
        if maximize:
            if fitness_values[index] > fitness_values[best_index]:
                best_index = index
        else:
            if fitness_values[index] < fitness_values[best_index]:
                best_index = index

    return population[best_index][:]