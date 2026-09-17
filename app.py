from flask import Flask, jsonify, request, send_from_directory
from algorithms.GA import optimize as ga_optimize
from algorithms.SA import optimize as sa_optimize
from algorithms.ACO import optimize as aco_optimize
from algorithms.PSO import optimize as pso_optimize
from algorithms.ABC import optimize as abc_optimize
from applications.scheduling import generate_jobs, run_algorithm as run_scheduling_algorithm
from applications.timetabling import generate_classes, run_algorithm as run_timetabling_algorithm
from applications.feature_selection import generate_features, generate_redundancy_matrix, run_algorithm as run_feature_algorithm
import random, math, time, statistics
import pandas as pd

app = Flask(__name__, static_folder="frontend", static_url_path="")
DATASET_PATH = "Mumbai_TSP_Dataset.csv"
SOURCE_ID = 50

app_state = {
    "cities": {},
    "matrix": {},
    "jobs": [],
    "classes": [],
    "features": [],
    "feature_redundancy":[]
}

def calculate_distance(point1, point2):
    lat1, lon1 = map(math.radians, point1)
    lat2, lon2 = map(math.radians, point2)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = (math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2)
    return 6371 * 2 * math.atan2(math.sqrt(a),math.sqrt(1 - a))

def create_distance_matrix(cities):
    matrix = {}
    for a in cities:
        matrix[a] = {}
        for b in cities:
            if a == b:
                matrix[a][b] = 0
            else:
                matrix[a][b] = calculate_distance(cities[a],cities[b])
    return matrix

def route_distance(route, matrix):
    total = 0
    for i in range(len(route) - 1):
        total += matrix[route[i]][route[i + 1]]
    return total

def create_route(cities):
    nodes = [
        node
        for node in cities
        if node != "SOURCE"
    ]
    random.shuffle(nodes)
    return ["SOURCE"] + nodes + ["SOURCE"]

def route_crossover(parent1, parent2):
    inner1 = parent1[1:-1]
    inner2 = parent2[1:-1]
    size = len(inner1)
    if size < 2:
        return parent1[:]
    start, end = sorted (random.sample(range(size),2))
    child = [None] * size
    child[start:end] = inner1[start:end]
    remaining = [
        city
        for city in inner2
        if city not in child
    ]
    position = 0

    for i in range(size):
        if child[i] is None:
            child[i] = remaining[position]
            position += 1
    return ["SOURCE"] + child + ["SOURCE"]

def route_mutation(route):
    child = route[:]
    if len(child) > 4:
        i, j = random.sample(range(1,len(child) - 1),2)
        child[i], child[j] = (child[j],child[i])
    return child

def route_neighbor(route):
    return route_mutation(route)

def aco_route_solution(nodes,pheromone,matrix):
    unvisited = [
        node
        for node in nodes
        if node != "SOURCE"
    ]
    route = ["SOURCE"]
    current = "SOURCE"

    while unvisited:
        weights = []
        for node in unvisited:
            pheromone_value = pheromone.get((current, node),1.0)
            distance = matrix[current][node]
            weight = (pheromone_value * (1 / (distance + 1e-10)))
            weights.append(weight)
        total = sum(weights)

        if total == 0:
            next_node = random.choice(unvisited)
        else:
            next_node = random.choices(
                unvisited,
                weights=weights,
                k=1
            )[0]

        route.append(next_node)
        unvisited.remove(next_node)
        current = next_node
    route.append("SOURCE")
    return route

def run_single_algorithm(algorithm_name,cities,matrix,parameters=None):
    parameters = parameters or {}
    def fitness(route):
        return route_distance(route,matrix)
    start_time = time.perf_counter()

    if algorithm_name == "GA":
        result = ga_optimize(
            fitness_function=fitness,
            create_solution=lambda: create_route(cities),
            crossover=route_crossover,
            mutate=route_mutation,
            population_size=parameters.get("population_size",30),
            generations=parameters.get("generations",100),
            maximize=False
        )

    elif algorithm_name == "SA":
        result = sa_optimize(
            initial_solution=create_route(cities),
            fitness_function=fitness,
            neighbor_function=route_neighbor,
            initial_temperature=parameters.get("temperature",1000),
            cooling_rate=parameters.get("cooling_rate",0.95),
            iterations=parameters.get("iterations",500),
            maximize=False
        )

    elif algorithm_name == "ACO":
        nodes = list(cities.keys())
        result = aco_optimize(
            nodes=nodes,
            construct_solution=lambda n, p:
                aco_route_solution(n,p,matrix),
            fitness_function=fitness,
            ants=parameters.get("ants",20),
            iterations=parameters.get("iterations",100),
            evaporation=parameters.get("evaporation",0.5),
            maximize=False
        )

    elif algorithm_name == "PSO":
        nodes = [
            node
            for node in cities
            if node != "SOURCE"
        ]

        def position_to_route(position):
            ordered = sorted(zip(position,nodes))
            return ["SOURCE"] + [node for _, node in ordered] + ["SOURCE"]

        def pso_fitness(position):
            return fitness(position_to_route(position))

        result = pso_optimize(
            dimensions=len(nodes),
            fitness_function=pso_fitness,
            lower_bound=0,
            upper_bound=1,
            particles=parameters.get("particles",30),
            iterations=parameters.get("iterations",100),
            inertia=parameters.get("inertia",0.7),
            cognitive=parameters.get("cognitive",1.5),
            social=parameters.get("social",1.5),
            maximize=False
        )
        result["best_solution"] = position_to_route(result["best_solution"])

    elif algorithm_name == "ABC":
        result = abc_optimize(
            create_solution=lambda:
                create_route(cities),
            fitness_function=fitness,
            neighbor_function=route_neighbor,
            bees=parameters.get("bees",30),
            iterations=parameters.get("iterations",100),
            limit=parameters.get("limit",20),
            maximize=False
        )
    else:
        raise ValueError("Unknown algorithm")

    execution_time = (time.perf_counter() - start_time)
    convergence = result.get("convergence",[])

    return {
        "algorithm": algorithm_name,
        "best_solution": result["best_solution"],
        "best_fitness": result["best_fitness"],
        "distance": result["best_fitness"],
        "execution_time": execution_time,
        "iterations": len(convergence),
        "convergence": convergence
    }

def ga_like_pso(nodes,fitness_function,parameters):
    dimensions = len(nodes)

    def position_to_route(position):
        ordered = sorted(zip(position,nodes))
        return ["SOURCE"] + [node for _, node in ordered] + ["SOURCE"]

    result = pso_optimize(
        dimensions=dimensions,
        fitness_function=fitness_function,
        lower_bound=0,
        upper_bound=1,
        particles=parameters.get("particles",30),
        iterations=parameters.get("iterations",100),
        inertia=parameters.get("inertia",0.7),
        cognitive=parameters.get("cognitive",1.5),
        social=parameters.get("social",1.5),
        maximize=False
    )
    result["best_solution"] = position_to_route(result["best_solution"])
    return result

@app.route("/")
@app.route("/home")
@app.route("/routing")
@app.route("/applications")
@app.route("/appplications")
def home():
    return send_from_directory("frontend","index.html")

@app.route("/applications/<path:application>")
@app.route("/appplications/<path:application>")
def application_page(application):
    return send_from_directory("frontend", "index.html")

@app.route("/generate_cities",methods=["POST"])
def generate_cities():
    data = request.get_json(silent=True) or {}
    try:
        count = int(data.get("count",0))
    except (TypeError,ValueError):
        return jsonify({"error":"Please enter a valid number of locations."}), 400

    try:
        df = pd.read_csv(DATASET_PATH)
    except FileNotFoundError:
        return jsonify({"error":f"Dataset file '{DATASET_PATH}' was not found."}), 500
    except Exception as error:
        return jsonify({"error":f"Unable to read dataset: {str(error)}"}), 500

    required_columns = ["ID","Location","Latitude","Longitude"]
    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        return jsonify({"error":"Dataset is missing required columns: " + ", ".join(missing_columns)}), 400

    source_row = df[df["ID"] == SOURCE_ID]

    if source_row.empty:
        return jsonify({"error":"Source ID 50 was not found in the dataset."}), 400

    available_locations = df[df["ID"] != SOURCE_ID]
    max_locations = len(available_locations)

    if count < 2 or count > max_locations:
        return jsonify({"error":f"Please enter a number between 2 and {max_locations}."}), 400

    source = source_row.iloc[0]
    cities = {
        "SOURCE": (
            float(source["Latitude"]),
            float(source["Longitude"])
        )
    }
    selected = available_locations.head(count)

    for _, row in selected.iterrows():
        cities[str(row["Location"])] = (
            float(row["Latitude"]),
            float(row["Longitude"])
        )
    app_state["cities"] = cities
    app_state["matrix"] = (create_distance_matrix(cities))
    return jsonify({
        "cities": cities,
        "count": count,
        "total_nodes": len(cities),
        "source": {
            "id": SOURCE_ID,
            "location": str(source["Location"]),
            "latitude": float(source["Latitude"]),
            "longitude": float(source["Longitude"])
        }
    })

@app.route("/run_algorithm",methods=["POST"])
def run_algorithm():
    data = request.get_json(silent=True) or {}
    algorithm_name = data.get("algorithm","GA")
    cities = app_state["cities"]
    matrix = app_state["matrix"]
    if not cities:
        return jsonify({"error":"Generate cities first."}), 400
    try:
        result = run_single_algorithm(
            algorithm_name,
            cities,
            matrix,
            data.get("parameters")
        )

        return jsonify(result)

    except Exception as error:
        return jsonify({"error": str(error)}), 500

@app.route("/compare_algorithms",methods=["POST"])
def compare_algorithms():
    cities = app_state["cities"]
    matrix = app_state["matrix"]
    if not cities:
        return jsonify({"error":"Generate cities first."}), 400

    algorithms = ["GA","SA","ACO","PSO","ABC"]
    results = []

    for algorithm in algorithms:
        try:
            result = run_single_algorithm(algorithm,cities,matrix)
            results.append(result)
        except Exception as error:
            results.append({"algorithm": algorithm,"error": str(error)})

    valid_results = [
        result
        for result in results
        if "distance" in result
    ]

    if valid_results:
        best_distance = min(
            result["distance"]
            for result in valid_results
        )

        tied = [
            result
            for result in valid_results
            if abs(result["distance"] - best_distance) < 1e-9
        ]
        best = min(tied,key=lambda x:x["execution_time"])

        if len(tied) > 1:
            conclusion = (
                f"Distance is tied between "
                f"{', '.join(x['algorithm'] for x in tied)}. "
                f"{best['algorithm']} is preferred "
                f"because it has the lower execution time."
            )
        else:
            conclusion = (
                f"{best['algorithm']} provides "
                f"the best overall result."
            )
    else:
        conclusion = ("No valid results available.")
    return jsonify({"results": results,"conclusion": conclusion})

@app.route("/sensitivity",methods=["POST"])
def sensitivity():
    data = request.get_json(silent=True) or {}
    algorithm = data.get("algorithm","GA")
    parameter = data.get("parameter")
    cities = app_state["cities"]
    matrix = app_state["matrix"]

    if not cities:
        return jsonify({"error":"Generate cities first."}), 400

    parameter_map = {
        "GA": {
            "population_size": "Population Size",
            "generations": "Generations",
            "mutation_rate": "Mutation Rate"
        },
        "SA": {
            "temperature": "Initial Temperature",
            "cooling_rate": "Cooling Rate",
            "iterations": "Iterations"
        },
        "ACO": {
            "ants": "Ants",
            "iterations": "Iterations",
            "evaporation": "Evaporation"
        },
        "PSO": {
            "particles": "Particles",
            "iterations": "Iterations",
            "inertia": "Inertia"
        },
        "ABC": {
            "bees": "Bees",
            "iterations": "Iterations",
            "limit": "Limit"
        }
    }

    if algorithm not in parameter_map:
        return jsonify({"error":"Invalid algorithm."}), 400

    if parameter not in parameter_map[algorithm]:
        return jsonify({"error":"Invalid parameter for selected algorithm."}), 400

    input_values = data.get("values")
    if not isinstance(input_values,list) or not input_values:
        return jsonify({"error":"Please enter at least one parameter value."}), 400
    values = []

    try:
        for value in input_values:
            if parameter in ["mutation_rate","temperature","cooling_rate","evaporation","inertia"]:
                value = float(value)
            else:
                value = int(value)

            if parameter == "mutation_rate":
                if value <= 0 or value >= 1:
                    raise ValueError("Mutation Rate values must be greater than 0 and less than 1.")
            elif parameter == "cooling_rate":
                if value <= 0 or value >= 1:
                    raise ValueError("Cooling Rate values must be greater than 0 and less than 1.")
            elif parameter == "evaporation":
                if value <= 0 or value >= 1:
                    raise ValueError("Evaporation values must be greater than 0 and less than 1.")
            elif parameter == "inertia":
                if value <= 0:
                    raise ValueError("Inertia values must be greater than 0.")
            elif value <= 0:
                raise ValueError("Parameter values must be greater than 0.")

            result = run_single_algorithm(algorithm,cities,matrix,{parameter:value})
            values.append({
                "parameter":value,
                "distance":result["distance"],
                "execution_time":result["execution_time"]
            })
    except (TypeError,ValueError) as error:
        return jsonify({"error": str(error)}), 400

    return jsonify({
        "algorithm":algorithm,
        "parameter":parameter,
        "parameter_name":parameter_map[algorithm][parameter],
        "values":values
    })

@app.route("/statistics",methods=["POST"])
def statistics_route():
    data = request.get_json(silent=True) or {}
    algorithm = data.get("algorithm","GA")
    try:
        runs = int(data.get("runs",10))
    except (TypeError,ValueError):
        return jsonify({"error":"Runs must be a valid number."}), 400

    if runs < 1:
        return jsonify({"error":"Number of runs must be at least 1."}), 400
    cities = app_state["cities"]
    matrix = app_state["matrix"]

    if not cities:
        return jsonify({"error":"Generate cities first."}), 400

    distances = []
    execution_times = []

    for _ in range(runs):
        result = run_single_algorithm(algorithm,cities,matrix)
        distances.append(result["distance"])
        execution_times.append(result["execution_time"])

    return jsonify({
        "algorithm": algorithm,
        "runs": runs,
        "average":statistics.mean(distances),
        "best":min(distances),
        "worst":max(distances),
        "variance":statistics.pvariance(distances),
        "average_execution_time":statistics.mean(execution_times)
    })

@app.route("/applications/scheduling",methods=["POST"])
def scheduling():
    data = request.get_json(silent=True) or {}
    try:
        count = int(data.get("count",0))
    except (TypeError,ValueError):
        return jsonify({"error":"Enter a valid number of jobs."}), 400

    if count < 2 or count > 50:
        return jsonify({"error":"Number of jobs must be between 2 and 50."}), 400

    algorithm = data.get("algorithm","GA")
    jobs = data.get("jobs")

    if not isinstance(jobs, list) or len(jobs) != count:
        jobs = generate_jobs(count)

    try:
        jobs = [
            {
                "id": str(job["id"]).strip(),
                "processing_time": int(job["processing_time"]),
                "priority": int(job["priority"])
            }
            for job in jobs
        ]
        if (
            any(not job["id"] or job["processing_time"] < 1 or job["priority"] < 1 for job in jobs)
            or len({job["id"] for job in jobs}) != len(jobs)
        ):
            raise ValueError
    except (KeyError, TypeError, ValueError):
        return jsonify({"error":"Enter valid job names, processing times, and priorities."}), 400

    app_state["jobs"] = jobs

    try:
        result = run_scheduling_algorithm(algorithm,jobs)
        return jsonify(result)
    except Exception as error:
        return jsonify({"error": str(error)}), 500

@app.route("/applications/timetabling",methods=["POST"])
def timetabling():
    data = request.get_json(silent=True) or {}
    try:
        count = int(data.get("count",0))
        teacher_count = int(data.get("teacher_count",0))
    except (TypeError,ValueError):
        return jsonify({"error":"Enter valid numbers for classes and teachers."}), 400

    if count < 2 or count > 30:
        return jsonify({"error":"Number of classes must be between 2 and 30."}), 400

    if teacher_count < 1 or teacher_count > count:
        return jsonify({"error":"Number of teachers must be between 1 and the number of classes."}), 400

    algorithm = data.get("algorithm","GA")
    classes = data.get("classes")
    if (not isinstance(classes, list) or len(classes) != count):
        classes = generate_classes(count,teacher_count)
    app_state["classes"] = classes

    try:
        result = run_timetabling_algorithm(algorithm,classes)
        return jsonify(result)
    except Exception as error:
        return jsonify({"error": str(error)}), 500

@app.route("/applications/feature_selection", methods=["POST"])
def feature_selection():
    data = request.get_json(silent=True) or {}
    algorithm = data.get("algorithm","GA")
    features = data.get("features")

    if not isinstance(features, list) or not features:
        return jsonify({"error": "Add at least one feature."}), 400

    cleaned_features = []

    for index, feature in enumerate(features, start=1):
        if isinstance(feature, dict):
            feature_id = str(
                feature.get("id",f"F{index}")).strip()
        else:
            feature_id = str(feature).strip()

        if not feature_id:
            continue

        relevance = (feature.get("relevance", round(random.uniform(0.30, 1.00), 2))
                 if isinstance(feature, dict)
                 else round(random.uniform(0.30, 1.00), 2))

        cleaned_features.append({"id": feature_id,"relevance": float(relevance)})

    if not cleaned_features:
        return jsonify({"error": "No valid features were provided."}), 400

    features = cleaned_features
    app_state["features"] = features
    redundancy_matrix = generate_redundancy_matrix(features)
    app_state["feature_redundancy"] = (redundancy_matrix)

    try:
        result = run_feature_algorithm(algorithm,features,redundancy_matrix)
        return jsonify(result)
    except Exception as error:
        return jsonify({"error": str(error)}), 500

if __name__ == "__main__":
    app.run(debug=True,port=5000)