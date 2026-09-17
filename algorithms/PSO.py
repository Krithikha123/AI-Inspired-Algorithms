import random


def optimize(
    dimensions,
    fitness_function,
    lower_bound,
    upper_bound,
    particles=30,
    iterations=100,
    inertia=0.7,
    cognitive=1.5,
    social=1.5,
    maximize=False
):
    positions = []
    velocities = []

    for _ in range(particles):
        position = [
            random.uniform(lower_bound, upper_bound)
            for _ in range(dimensions)
        ]

        velocity = [
            random.uniform(
                -(upper_bound - lower_bound) * 0.1,
                (upper_bound - lower_bound) * 0.1
            )
            for _ in range(dimensions)
        ]

        positions.append(position)
        velocities.append(velocity)

    personal_best_positions = [
        position[:]
        for position in positions
    ]

    personal_best_fitness = [
        fitness_function(position)
        for position in positions
    ]

    global_best_index = 0

    for i in range(1, particles):
        if _is_better(
            personal_best_fitness[i],
            personal_best_fitness[global_best_index],
            maximize
        ):
            global_best_index = i

    global_best_position = (
        personal_best_positions[global_best_index][:]
    )

    global_best_fitness = (
        personal_best_fitness[global_best_index]
    )

    convergence = []

    for _ in range(iterations):

        for i in range(particles):

            for d in range(dimensions):

                r1 = random.random()
                r2 = random.random()

                velocities[i][d] = (
                    inertia * velocities[i][d]
                    + cognitive * r1 * (
                        personal_best_positions[i][d]
                        - positions[i][d]
                    )
                    + social * r2 * (
                        global_best_position[d]
                        - positions[i][d]
                    )
                )

                positions[i][d] += velocities[i][d]

                positions[i][d] = max(
                    lower_bound,
                    min(upper_bound, positions[i][d])
                )

            fitness = fitness_function(
                positions[i]
            )

            if _is_better(
                fitness,
                personal_best_fitness[i],
                maximize
            ):
                personal_best_positions[i] = positions[i][:]
                personal_best_fitness[i] = fitness

            if _is_better(
                fitness,
                global_best_fitness,
                maximize
            ):
                global_best_position = positions[i][:]
                global_best_fitness = fitness

        convergence.append(global_best_fitness)

    return {
        "best_solution": global_best_position,
        "best_fitness": global_best_fitness,
        "convergence": convergence
    }


def _is_better(a, b, maximize):
    return a > b if maximize else a < b