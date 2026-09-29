import random, time
from algorithms.GA import optimize as ga_optimize
from algorithms.SA import optimize as sa_optimize
from algorithms.ACO import optimize as aco_optimize
from algorithms.PSO import optimize as pso_optimize
from algorithms.ABC import optimize as abc_optimize

DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"]
TIMES = ["09:00-10:00","10:00-11:00","11:15-12:15"]

def generate_classes(class_count, teacher_count):
    classes = []
    total_slots = len(DAYS) * len(TIMES)
    for i in range(1, class_count + 1):
        slot = random.randrange(total_slots)
        day, time_slot = slot_to_day_time(slot)
        classes.append({
            "id": f"C{i}",
            "teacher": f"T{random.randint(1, teacher_count)}",
            "slot": slot,
            "preferred_slot": f"{day} {time_slot}"
        })
    return classes

def slot_to_day_time(slot):
    day_index = slot // len(TIMES)
    time_index = slot % len(TIMES)
    return (DAYS[day_index],TIMES[time_index])

def timetable_fitness(solution, classes):
    teacher_slots = {}
    penalty = 0
    for index, slot in enumerate(solution):
        teacher = classes[index]["teacher"]
        teacher_key = (teacher, slot)
        if teacher_key in teacher_slots:
            penalty += 100
        teacher_slots[teacher_key] = True
        if slot == classes[index]["slot"]:
            penalty -= 1
    return penalty

def create_solution(classes):
    slots = list(range(len(DAYS) * len(TIMES)))
    return [
        random.choice(slots)
        for _ in classes
    ]

def mutate(solution):
    child = solution[:]
    if child:
        index = random.randrange(len(child))
        child[index] = random.randrange(len(DAYS) * len(TIMES))
    return child

def neighbor(solution):
    return mutate(solution)

def crossover(parent1, parent2):
    if len(parent1) < 2:
        return parent1[:]
    point = random.randint(1,len(parent1) - 1)
    return (parent1[:point] + parent2[point:])

def aco_solution(nodes, pheromone):
    slots = []
    for node in nodes:
        weights = []
        for slot in range(len(DAYS) * len(TIMES)):
            value = pheromone.get((node, slot),1.0)
            weights.append(value)
        total = sum(weights)

        if total <= 0:
            selected = random.randrange(len(DAYS) * len(TIMES))
        else:
            selected = random.choices(
                range(len(DAYS) * len(TIMES)),
                weights=weights,
                k=1
            )[0]
        slots.append(selected)
    return slots

def run_algorithm(algorithm, classes):
    fitness = lambda solution: timetable_fitness(solution,classes)
    start_time = time.perf_counter()

    if algorithm == "GA":
        result = ga_optimize(
            fitness_function=fitness,
            create_solution=lambda: create_solution(classes),
            crossover=crossover,
            mutate=mutate,
            population_size=30,
            generations=100,
            maximize=False
        )

    elif algorithm == "SA":
        result = sa_optimize(
            initial_solution=create_solution(classes),
            fitness_function=fitness,
            neighbor_function=neighbor,
            initial_temperature=1000,
            cooling_rate=0.95,
            iterations=500,
            maximize=False
        )

    elif algorithm == "ACO":
        nodes = list(range(len(classes)))
        result = aco_optimize(
            nodes=nodes,
            construct_solution=lambda n, p: aco_solution(n, p),
            fitness_function=fitness,
            ants=20,
            iterations=100,
            evaporation=0.5,
            maximize=False
        )

    elif algorithm == "PSO":
        def decode(position):
            return [max(0,min(
                        len(DAYS) * len(TIMES) - 1,
                        int(round(value))
                    )
                ) for value in position
            ]

        def pso_fitness(position):
            return fitness(decode(position))

        result = pso_optimize(
            dimensions=len(classes),
            fitness_function=pso_fitness,
            lower_bound=0,
            upper_bound=len(DAYS) * len(TIMES) - 1,
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
            create_solution=lambda: create_solution(classes),
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
    timetable = []
    changes = []

    for index, slot in enumerate(result["best_solution"]):
        day, time_slot = slot_to_day_time(slot)
        original_slot = classes[index]["slot"]
        original_day, original_time = slot_to_day_time(original_slot)

        timetable.append({
            "class": classes[index]["id"],
            "teacher": classes[index]["teacher"],
            "day": day,
            "time": time_slot
        })

        if original_slot != slot:
            changes.append({
                "class": classes[index]["id"],
                "teacher": classes[index]["teacher"],
                "original_slot": f"{original_day} {original_time}",
                "optimized_slot": f"{day} {time_slot}"
            })
            
    teacher_conflicts = 0
    time_conflicts = 0
    teacher_slots = set()
    time_slots = set()
    for item in timetable:
        key = (item["teacher"], item["day"], item["time"])
        if key in teacher_slots:
            teacher_conflicts += 1
        teacher_slots.add(key)
        time_key = (item["day"], item["time"])
        if time_key in time_slots:
            time_conflicts += 1
        time_slots.add(time_key)
        
    return {
        "algorithm": algorithm,
        "classes": classes,
        "timetable": timetable,
        "changes": changes,
        "fitness": result["best_fitness"],
        "conflicts": teacher_conflicts,
        "teacher_conflicts": teacher_conflicts,
        "time_conflicts": time_conflicts,
        "execution_time": execution_time,
        "convergence": result.get("convergence", [])
    }