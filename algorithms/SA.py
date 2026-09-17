import math
import random


def optimize(
    initial_solution,
    fitness_function,
    neighbor_function,
    initial_temperature=1000,
    cooling_rate=0.95,
    iterations=500,
    maximize=False
):
    current_solution = initial_solution[:]
    current_fitness = fitness_function(current_solution)

    best_solution = current_solution[:]
    best_fitness = current_fitness

    temperature = max(float(initial_temperature), 1e-12)
    cooling_rate = min(max(float(cooling_rate), 0.0001), 0.999999)

    convergence = []

    for _ in range(iterations):
        neighbor_solution = neighbor_function(current_solution)
        neighbor_fitness = fitness_function(neighbor_solution)

        if maximize:
            difference = neighbor_fitness - current_fitness
            improvement = neighbor_fitness > current_fitness
        else:
            difference = current_fitness - neighbor_fitness
            improvement = neighbor_fitness < current_fitness

        if improvement:
            current_solution = neighbor_solution
            current_fitness = neighbor_fitness
        else:
            exponent = difference / temperature
            exponent = max(-700, min(700, exponent))

            probability = math.exp(exponent)

            if random.random() < probability:
                current_solution = neighbor_solution
                current_fitness = neighbor_fitness

        if maximize:
            if current_fitness > best_fitness:
                best_solution = current_solution[:]
                best_fitness = current_fitness
        else:
            if current_fitness < best_fitness:
                best_solution = current_solution[:]
                best_fitness = current_fitness

        convergence.append(best_fitness)

        temperature *= cooling_rate
        temperature = max(temperature, 1e-12)

    return {
        "best_solution": best_solution,
        "best_fitness": best_fitness,
        "convergence": convergence
    }