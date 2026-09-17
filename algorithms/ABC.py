import random


def optimize(
    create_solution,
    fitness_function,
    neighbor_function,
    bees=30,
    iterations=100,
    limit=20,
    maximize=False
):
    solutions = [
        create_solution()
        for _ in range(bees)
    ]

    fitness_values = [
        fitness_function(solution)
        for solution in solutions
    ]

    trial = [0] * bees

    best_solution = None
    best_fitness = None
    convergence = []

    def is_better(a, b):
        if b is None:
            return True
        return a > b if maximize else a < b

    for _ in range(iterations):

        for i in range(bees):
            candidate = neighbor_function(
                solutions[i]
            )

            candidate_fitness = fitness_function(
                candidate
            )

            if is_better(
                candidate_fitness,
                fitness_values[i]
            ):
                solutions[i] = candidate[:]
                fitness_values[i] = candidate_fitness
                trial[i] = 0
            else:
                trial[i] += 1

        probabilities = calculate_probabilities(
            fitness_values,
            maximize
        )

        for _ in range(bees):

            i = roulette_selection(probabilities)

            candidate = neighbor_function(
                solutions[i]
            )

            candidate_fitness = fitness_function(
                candidate
            )

            if is_better(
                candidate_fitness,
                fitness_values[i]
            ):
                solutions[i] = candidate[:]
                fitness_values[i] = candidate_fitness
                trial[i] = 0
            else:
                trial[i] += 1

        for i in range(bees):

            if trial[i] >= limit:
                solutions[i] = create_solution()
                fitness_values[i] = fitness_function(
                    solutions[i]
                )
                trial[i] = 0

        for i in range(bees):

            if is_better(
                fitness_values[i],
                best_fitness
            ):
                best_solution = solutions[i][:]
                best_fitness = fitness_values[i]

        convergence.append(best_fitness)

    return {
        "best_solution": best_solution,
        "best_fitness": best_fitness,
        "convergence": convergence
    }


def calculate_probabilities(
    fitness_values,
    maximize
):
    if maximize:
        minimum = min(fitness_values)

        scores = [
            value - minimum + 1e-10
            for value in fitness_values
        ]
    else:
        maximum = max(fitness_values)

        scores = [
            maximum - value + 1e-10
            for value in fitness_values
        ]

    total = sum(scores)

    if total == 0:
        return [
            1 / len(scores)
            for _ in scores
        ]

    return [
        score / total
        for score in scores
    ]


def roulette_selection(probabilities):
    value = random.random()
    cumulative = 0

    for index, probability in enumerate(probabilities):
        cumulative += probability

        if value <= cumulative:
            return index

    return len(probabilities) - 1