document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.querySelectorAll(".nav-btn");
    const pages = document.querySelectorAll(".page");
    const routingMenus = document.querySelectorAll(".routing-menu");
    const routingSections = document.querySelectorAll(".routing-section");
    const applicationButtons = document.querySelectorAll(".application-btn");
    const applicationWorks = document.querySelectorAll(".application-work");
    const applicationsPageHeader = document.querySelector("#applications-page > .page-header");
    const applicationsWorkflow = document.querySelector("#applications-page .working-of-apps");

    function updateBrowserUrl(path) {
        if (window.location.pathname !== path) {
            window.history.pushState({}, "", path);
        }
    }

    function getRoute() {
        const segments = decodeURIComponent(window.location.pathname)
            .split("/")
            .filter(Boolean)
            .map(segment => segment.toLowerCase());

        const pageName = segments[0] || "home";

        if (pageName === "routing") {
            return { page: "routing" };
        }

        if (pageName === "applications" || pageName === "appplications") {
            const application = segments.slice(1).join("-")
                .replace(/_/g, "-")
                .replace(/\s+/g, "-");

            return {
                page: "applications",
                application: application || null
            };
        }

        return { page: "home" };
    }

    function showPage(pageName, updateUrl = true) {
        pages.forEach(page => {
            page.classList.remove("active");
        });
        const page = document.getElementById(`${pageName}-page`);

        document.body.classList.toggle(
            "applications-mode",
            pageName === "applications"
        );

        if (pageName === "applications") {
            applicationsPageHeader?.classList.remove("hidden");
            applicationsWorkflow?.classList.remove("hidden");
        }

        if (page) {
            page.classList.add("active");
        }

        if (updateUrl) {
            updateBrowserUrl(pageName === "home" ? "/home" : `/${pageName}`);
        }

        navButtons.forEach(button => {
            button.classList.toggle("active",button.dataset.page === pageName);
        });
    }

    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            showPage(button.dataset.page);
        });
    });

    routingMenus.forEach(menu => {
        menu.addEventListener("click", () => {
            const sectionName = menu.dataset.routingSection;

            routingMenus.forEach(item => {
                item.classList.remove("active");
            });

            routingSections.forEach(section => {
                section.classList.remove("active");
            });
            menu.classList.add("active");
            const section = document.getElementById(`${sectionName}-section`);

            if (section) {
                section.classList.add("active");
            }

            if (sectionName === "comparison") {
                compareAlgorithms();
            }
        });
    });

    function selectApplication(applicationName, updateUrl = true) {
        const button = [...applicationButtons].find(
            item => item.dataset.application === applicationName
        );

        if (!button) {
            return;
        }

        applicationsPageHeader?.classList.add("hidden");
        applicationsWorkflow?.classList.add("hidden");

        applicationWorks.forEach(work => {
            work.classList.add("hidden");
        });

        const selectedWork = document.getElementById(`${applicationName}-workspace`);

        if (selectedWork) {
            selectedWork.classList.remove("hidden");
            if (updateUrl) {
                updateBrowserUrl(`/applications/${applicationName}`);
            }
            if (updateUrl) {
                selectedWork.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }

        applicationButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
    }

    applicationButtons.forEach(button => {
        button.addEventListener("click", () => {
            selectApplication(button.dataset.application);
        });
    });

    function applyCurrentRoute() {
        const route = getRoute();
        showPage(route.page, false);

        if (route.application) {
            selectApplication(route.application, false);
        }
    }

    window.addEventListener("popstate", applyCurrentRoute);
    applyCurrentRoute();

    const generateButton = document.getElementById("generate-cities");

    if (generateButton) {
        generateButton.addEventListener("click", generateCities);
    }

    const runRoutingButton = document.getElementById("run-routing");

    if (runRoutingButton) {
        runRoutingButton.addEventListener("click", runRoutingAlgorithm);
    }

    const runPerformanceButton = document.getElementById("run-performance");

    if (runPerformanceButton) {
        runPerformanceButton.addEventListener(
            "click",
            runPerformanceAnalysis
        );
    }

    const performanceAlgorithm = document.getElementById(
        "performance-algorithm"
    );

    if (performanceAlgorithm) {
        performanceAlgorithm.addEventListener(
            "change",
            updatePerformanceParameter
        );
    }

    const performanceParameter = document.getElementById(
        "performance-parameter"
    );

    if (performanceParameter) {
        performanceParameter.addEventListener(
            "change",
            updatePerformanceValues
        );
    }

    const runSchedulingButton = document.getElementById("run-scheduling");

    if (runSchedulingButton) {
        runSchedulingButton.addEventListener(
            "click",
            runScheduling
        );
    }

    const jobsTable = document.getElementById("jobs-table");

    if (jobsTable) {
        jobsTable.addEventListener("click", event => {
            const button = event.target.closest("button");

            if (!button) {
                return;
            }

            if (button.classList.contains("remove-job-btn")) {
                removeSchedulingJob(button.dataset.jobId);
            } else if (button.classList.contains("edit-job-btn")) {
                editSchedulingJob(button.dataset.jobId);
            }
        });
    }

    const addFeatureButton =
        document.getElementById(
            "add-feature-btn"
        );

    if (addFeatureButton) {
        addFeatureButton.addEventListener("click", () => {
            const form = document.getElementById("add-feature-form");

            if (form) {
                form.style.display = form.style.display === "none" ? "flex" : "none";
            }
        });
    }

    const saveFeatureButton = document.getElementById("save-feature-btn");

    if (saveFeatureButton) {
        saveFeatureButton.addEventListener("click", addFeature);
    }

    const featureList =
        document.getElementById(
            "feature-list"
        );

    if (featureList) {
        featureList.addEventListener(
            "click",
            event => {
                const button = event.target.closest("button");

                if (!button) {
                    return;
                }

                if (button.classList.contains("remove-feature-btn")) {
                    removeFeature(button.dataset.featureId);
                } else if (button.classList.contains("edit-feature-btn")) {
                    editFeature(button.dataset.featureId);
                }
            }
        );
    }

    const runFeatureButton = document.getElementById(
        "run-feature-selection"
    );

    if (runFeatureButton) {
        runFeatureButton.addEventListener(
            "click",
            runFeatureSelection
        );
    }

    const addClassButton = document.getElementById("add-class-btn");
    if (addClassButton) {
        addClassButton.addEventListener("click", () => {
            const form = document.getElementById("add-class-form");

            if (form) {
                editingClassId = null;
                document.getElementById("new-class-id").value = "";
                document.getElementById("new-teacher-id").value = "";
                document.getElementById("save-class-btn").textContent = "Add";
                form.classList.toggle("hidden");
            }
        });
    }

    const saveClassButton = document.getElementById("save-class-btn");

    if (saveClassButton) {
        saveClassButton.addEventListener(
            "click",
            addNewTimetableClass
        );
    }

    const classesTable = document.getElementById("predefined-classes-table");

    if (classesTable) {
        classesTable.addEventListener("click", event => {
            const editButton = event.target.closest(".edit-class-btn");
            const removeButton = event.target.closest(".remove-class-btn");

            if (editButton) {
                editTimetableClass(editButton.dataset.classId);
                return;
            }

            if (removeButton) {
                removeTimetableClass(removeButton.dataset.classId);
            }
        });
    }

    const runTimetableButton = document.getElementById(
        "run-timetabling"
    );

    if (runTimetableButton) {
        runTimetableButton.addEventListener(
            "click",
            runTimetabling
        );
    }

    document
        .querySelectorAll(".algorithm-options button")
        .forEach(button => {
            button.addEventListener("click", () => {
                const parent = button.closest(".algorithm-options");

                if (!parent) {
                    return;
                }

                parent
                    .querySelectorAll("button")
                    .forEach(item => {
                        item.classList.remove("selected");
                    });

                button.classList.add("selected");
            });
        });

    const selectedLocationsToggle = document.getElementById(
        "selected-locations-toggle"
    );

    const selectedLocationsContent = document.getElementById(
        "selected-locations-content"
    );

    const selectedLocationsArrow = document.getElementById(
        "selected-locations-arrow"
    );

    if (
        selectedLocationsToggle &&
        selectedLocationsContent &&
        selectedLocationsArrow
    ) {
        selectedLocationsToggle.addEventListener("click", () => {
            selectedLocationsContent.classList.toggle("hidden");

            if (
                selectedLocationsContent.classList.contains(
                    "hidden"
                )
            ) {
                selectedLocationsArrow.textContent = "▼";
            } else {
                selectedLocationsArrow.textContent = "▲";
            }
        });
    }

    removePerformanceConvergence();
    updatePerformanceParameter();
    displaySchedulingJobs();
    displayFeatureList();
    initializeTimetable();
});

const addJobButton = document.getElementById("add-job-btn");
const saveJobButton = document.getElementById("save-job-btn");
let editingJobId = null;

if (addJobButton) {
    addJobButton.addEventListener("click", () => {
        const form = document.getElementById("add-job-form");

        if (form) {
            editingJobId = null;
            document.getElementById("job-id-input").value = "";
            document.getElementById("job-processing-input").value = "";
            document.getElementById("job-priority-input").value = "";
            form.style.display =
                form.style.display === "none"
                    ? "flex"
                    : "none";
        }
    });
}

if (saveJobButton) {
    saveJobButton.addEventListener(
        "click",
        addSchedulingJob
    );
}

let generatedCities = {};
let selectedRoutingAlgorithm = "GA";
let generatedClasses = [];
let editingClassId = null;

function initializeTimetable() {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const times = ["09:00-10:00", "10:00-11:00", "11:15-12:15"];
    const defaults = [
        ["C1", "T1", "Monday 09:00-10:00"],
        ["C2", "T1", "Tuesday 10:00-11:00"],
        ["C3", "T2", "Wednesday 09:00-10:00"],
        ["C4", "T2", "Thursday 11:15-12:15"],
        ["C5", "T2", "Friday 10:00-11:00"],
        ["C6", "T2", "Wednesday 09:00-10:00"]
    ];

    generatedClasses = defaults.map(([id, teacher, preferredSlot]) => {
        const [day, time] = preferredSlot.split(" ");
        return {
            id,
            teacher,
            preferred_slot: preferredSlot,
            slot: days.indexOf(day) * times.length + times.indexOf(time)
        };
    });

    displayTimetableInputData(generatedClasses);
    updateTimetableConstraints();
}

let generatedJobs = [
    {
        id: "J1",
        processing_time: 8,
        priority: 2
    },
    {
        id: "J2",
        processing_time: 12,
        priority: 1
    },
    {
        id: "J3",
        processing_time: 5,
        priority: 4
    },
    {
        id: "J4",
        processing_time: 10,
        priority: 3
    },
    {
        id: "J5",
        processing_time: 15,
        priority: 5
    },
];

let generatedFeatures = [
    {
        id: "hours_studied",
        relevance: 0.95
    },
    {
        id: "sleep_hours",
        relevance: 0.70
    },
    {
        id: "assignment_scores",
        relevance: 0.90
    },
    {
        id: "previous_percentage",
        relevance: 0.80
    },
    {
        id: "student_id",
        relevance: 0.00
    },
    {
        id: "roll_number",
        relevance: 0.00
    }
];

async function getJsonResponse(response) {
    const contentType =
        response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
        const text = await response.text();

        throw new Error(
            `Server returned an invalid response: ${text.substring(0, 150)}`
        );
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed.");
    }

    return data;
}

async function generateCities() {
    const cityInput = document.getElementById("city-count");

    if (!cityInput) {
        return;
    }

    const number = parseInt(cityInput.value);

    if (
        Number.isNaN(number) ||
        number < 2 ||
        number > 69
    ) {
        alert(
            "Number of locations must be between 2 and 69."
        );
        return;
    }

    try {
        const response = await fetch(
            "/generate_cities",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    count: number
                })
            }
        );

        const data = await getJsonResponse(response);

        generatedCities = data.cities;

        displayCities(data.cities);
        drawNetwork(data.cities);

        clearRoutingResults();
        clearCharts();
        clearPerformanceResults();

    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

function displayCities(cities) {
    const tableBody = document.getElementById(
        "cities-table"
    );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    Object.entries(cities).forEach(
        ([name, coordinates]) => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            const latitudeCell = document.createElement("td");
            const longitudeCell = document.createElement("td");

            nameCell.textContent = name;
            latitudeCell.textContent =
                Number(coordinates[0]).toFixed(4);
            longitudeCell.textContent =
                Number(coordinates[1]).toFixed(4);

            row.appendChild(nameCell);
            row.appendChild(latitudeCell);
            row.appendChild(longitudeCell);

            tableBody.appendChild(row);
        }
    );
}

function getCanvasDimensions(container, cityCount = 0) {
    const baseWidth = Math.max(
        container.clientWidth,
        700
    );

    let width = baseWidth;
    let height = 420;

    if (cityCount >= 20) {
        width = Math.max(baseWidth, 1000);
        height = 550;
    }

    if (cityCount >= 30) {
        width = Math.max(baseWidth, 1200);
        height = 650;
    }

    if (cityCount >= 40) {
        width = Math.max(baseWidth, 1400);
        height = 750;
    }

    if (cityCount >= 50) {
        width = Math.max(baseWidth, 1600);
        height = 850;
    }

    if (cityCount >= 60) {
        width = Math.max(baseWidth, 1800);
        height = 950;
    }

    return {
        width,
        height
    };
}

function getCityCoordinates(cities, canvas) {
    const points = Object.entries(cities);

    const latitudes = points.map(item => item[1][0]);
    const longitudes = points.map(item => item[1][1]);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);

    const padding = 55;

    function getX(lon) {
        if (maxLon === minLon) {
            return canvas.width / 2;
        }

        return (
            padding +
            ((lon - minLon) /
                (maxLon - minLon)) *
                (canvas.width - padding * 2)
        );
    }

    function getY(lat) {
        if (maxLat === minLat) {
            return canvas.height / 2;
        }

        return (
            canvas.height -
            padding -
            ((lat - minLat) /
                (maxLat - minLat)) *
                (canvas.height - padding * 2)
        );
    }

    const coordinates = {};

    points.forEach(([name, point]) => {
        coordinates[name] = {
            x: getX(point[1]),
            y: getY(point[0])
        };
    });

    return coordinates;
}

function drawNetwork(cities) {
    const networkArea =
        document.getElementById("network-area");

    if (!networkArea) {
        return;
    }

    networkArea.innerHTML = "";

    const cityCount =
        Object.keys(cities).length;

    const dimensions =
        getCanvasDimensions(
            networkArea,
            cityCount
        );

    const canvas =
        document.createElement("canvas");

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    networkArea.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    const coordinates =
        getCityCoordinates(
            cities,
            canvas
        );

    const names =
        Object.keys(cities);

    ctx.font = "12px Arial";

    names.forEach(name => {
        const point =
            coordinates[name];

        const isSource =
            name === "SOURCE";

        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            isSource ? 9 : 7,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            isSource
                ? "#2563eb"
                : "#ffffff";

        ctx.fill();

        ctx.strokeStyle =
            "#2563eb";

        ctx.lineWidth = 2;

        ctx.stroke();

        ctx.fillStyle =
            "#111827";

        ctx.font =
            isSource
                ? "bold 13px Arial"
                : "12px Arial";

        ctx.fillText(
            name,
            point.x + 10,
            point.y - 10
        );
    });
}

function drawBestRoute(route) {
    const networkArea =
        document.getElementById(
            "network-area"
        );

    if (
        !networkArea ||
        !generatedCities ||
        !Object.keys(generatedCities).length
    ) {
        return;
    }

    networkArea.innerHTML = "";

    const cityCount =
        Object.keys(generatedCities).length;

    const dimensions =
        getCanvasDimensions(
            networkArea,
            cityCount
        );

    const canvas =
        document.createElement("canvas");

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    networkArea.appendChild(canvas);

    const ctx =
        canvas.getContext("2d");

    const coordinates =
        getCityCoordinates(
            generatedCities,
            canvas
        );

    ctx.strokeStyle =
        "#2563eb";

    ctx.lineWidth = 2;

    for (
        let i = 0;
        i < route.length - 1;
        i++
    ) {
        const from =
            coordinates[route[i]];

        const to =
            coordinates[route[i + 1]];

        if (!from || !to) {
            continue;
        }

        ctx.beginPath();
        ctx.moveTo(
            from.x,
            from.y
        );
        ctx.lineTo(
            to.x,
            to.y
        );
        ctx.stroke();

        const midX =
            (from.x + to.x) / 2;

        const midY =
            (from.y + to.y) / 2;

        const angle =
            Math.atan2(
                to.y - from.y,
                to.x - from.x
            );

        ctx.save();

        ctx.translate(
            midX,
            midY
        );

        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-8, -4);
        ctx.lineTo(-8, 4);
        ctx.closePath();

        ctx.fillStyle =
            "#2563eb";

        ctx.fill();

        ctx.restore();
    }

    Object.entries(
        coordinates
    ).forEach(
        ([name, point]) => {
            const isSource =
                name === "SOURCE";

            ctx.beginPath();

            ctx.arc(
                point.x,
                point.y,
                isSource ? 9 : 7,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                isSource
                    ? "#2563eb"
                    : "#ffffff";

            ctx.fill();

            ctx.strokeStyle =
                "#2563eb";

            ctx.lineWidth = 2;

            ctx.stroke();

            ctx.fillStyle =
                "#111827";

            ctx.font =
                isSource
                    ? "bold 13px Arial"
                    : "12px Arial";

            ctx.fillText(
                name,
                point.x + 10,
                point.y - 10
            );
        }
    );
}

async function runRoutingAlgorithm() {
    const algorithmInput =
        document.getElementById(
            "routing-algorithm"
        );

    if (!algorithmInput) {
        return;
    }

    if (
        !generatedCities ||
        !Object.keys(generatedCities).length
    ) {
        alert(
            "Please load the network first."
        );
        return;
    }

    selectedRoutingAlgorithm =
        algorithmInput.value;

    try {
        const response =
            await fetch(
                "/run_algorithm",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify({
                            algorithm:
                                selectedRoutingAlgorithm
                        })
                }
            );

        const data =
            await getJsonResponse(
                response
            );

        const route =
            data.route ||
            data.best_solution ||
            [];

        data.route = route;
        data.fitness =
            data.fitness !== undefined
                ? data.fitness
                : data.best_fitness;

        displayRoutingResult(
            data
        );

        if (route.length) {
            drawBestRoute(
                route
            );
        }

    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

function displayRoutingResult(data) {
    const route =
        document.getElementById(
            "routing-result"
        );

    const distance =
        document.getElementById(
            "routing-distance"
        );

    const fitness =
        document.getElementById(
            "routing-fitness"
        );

    const time =
        document.getElementById(
            "routing-time"
        );

    if (route) {
        route.textContent =
            data.route
                ? data.route.join(" → ")
                : "—";
    }

    if (distance) {
        distance.textContent =
            data.distance !== undefined
                ? `${Number(data.distance).toFixed(2)} km`
                : "—";
    }

    if (fitness) {
        fitness.textContent =
            data.fitness !== undefined
                ? Number(data.fitness).toFixed(2)
                : "—";
    }

    if (time) {
        time.textContent =
            data.execution_time !== undefined
                ? `${Number(data.execution_time).toFixed(4)} s`
                : "—";
    }
}

async function compareAlgorithms() {
    if (
        !generatedCities ||
        !Object.keys(generatedCities).length
    ) {
        return;
    }

    try {
        const response =
            await fetch(
                "/compare_algorithms",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        const data =
            await getJsonResponse(
                response
            );

        displayComparison(
            data
        );

    } catch (error) {
        console.error(error);
    }
}

function displayComparison(data) {
    const table =
        document.getElementById(
            "routing-comparison-table"
        );

    if (!table) {
        return;
    }

    table.innerHTML = "";

    const results =
        data.values ||
        data.results || [];

    results.forEach(item => {
        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${item.algorithm || "—"}</td>
            <td>${item.distance !== undefined ? Number(item.distance).toFixed(2) : "—"}</td>
            <td>${item.execution_time !== undefined ? Number(item.execution_time).toFixed(4) : "—"}</td>
            <td>${(item.fitness !== undefined ? item.fitness : item.best_fitness) !== undefined ? Number(item.fitness !== undefined ? item.fitness : item.best_fitness).toFixed(2) : "—"}</td>
        `;

        table.appendChild(row);
    });

    drawComparisonCharts(
        results
    );

    const convergence = {};

    results.forEach(item => {
        if (
            item.algorithm &&
            Array.isArray(item.convergence) &&
            item.convergence.length
        ) {
            convergence[item.algorithm] =
                item.convergence;
        }
    });

    if (Object.keys(convergence).length) {
        drawConvergenceChart(
            convergence
        );
    }

    const conclusion =
        document.getElementById(
            "comparison-conclusion"
        );

    if (
        conclusion &&
        results.length
    ) {
        const fastest =
            [...results].sort(
                (a, b) =>
                    Number(
                        a.execution_time
                    ) -
                    Number(
                        b.execution_time
                    )
            )[0];

        conclusion.textContent =
            `${fastest.algorithm} achieved the lowest execution time among the tested algorithms.`;
    }
}

function drawComparisonCharts(results) {
    drawBarChart(
        "distance-chart",
        results,
        "distance",
        "Distance (km)"
    );

    drawBarChart(
        "time-chart",
        results,
        "execution_time",
        "Execution Time (s)"
    );
}

function drawBarChart(
    containerId,
    results,
    property,
    label
) {
    const container =
        document.getElementById(
            containerId
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!results.length) {
        container.innerHTML =
            "<p>No comparison data available.</p>";
        return;
    }

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        Math.max(
            container.clientWidth,
            500
        );

    canvas.height = 330;

    container.appendChild(canvas);

    const ctx =
        canvas.getContext("2d");

    const padding = 50;

    const values =
        results.map(
            item =>
                Number(
                    item[property]
                ) || 0
        );

    const maxValue =
        Math.max(...values, 1);

    const chartWidth =
        canvas.width -
        padding * 2;

    const chartHeight =
        canvas.height -
        padding * 2;

    const barWidth =
        chartWidth /
        results.length *
        0.6;

    results.forEach(
        (item, index) => {
            const value =
                Number(
                    item[property]
                ) || 0;

            const height =
                (value /
                    maxValue) *
                chartHeight;

            const x =
                padding +
                (
                    index +
                    0.2
                ) *
                    (
                        chartWidth /
                        results.length
                    );

            const y =
                canvas.height -
                padding -
                height;

            ctx.fillStyle =
                "#2563eb";

            ctx.fillRect(
                x,
                y,
                barWidth,
                height
            );

            ctx.fillStyle =
                "#111827";

            ctx.font =
                "12px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                item.algorithm,
                x +
                    barWidth / 2,
                canvas.height -
                    padding +
                    18
            );

            ctx.fillText(
                value.toFixed(2),
                x +
                    barWidth / 2,
                y - 7
            );
        }
    );

    ctx.strokeStyle =
        "#9ca3af";

    ctx.beginPath();

    ctx.moveTo(
        padding,
        padding
    );

    ctx.lineTo(
        padding,
        canvas.height -
            padding
    );

    ctx.lineTo(
        canvas.width -
            padding,
        canvas.height -
            padding
    );

    ctx.stroke();

    ctx.textAlign =
        "left";

    ctx.fillStyle =
        "#667085";

    ctx.font =
        "11px Arial";

    ctx.fillText(
        label,
        8,
        padding
    );
}

function drawConvergenceChart(data) {
    const container =
        document.getElementById(
            "convergence-chart"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const algorithms =
        Object.keys(data);

    if (!algorithms.length) {
        container.innerHTML =
            "<p>No convergence data available.</p>";
        return;
    }

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        Math.max(
            container.clientWidth,
            800
        );

    canvas.height = 400;

    container.appendChild(canvas);

    const ctx =
        canvas.getContext(
            "2d"
        );

    const paddingLeft = 65;
    const paddingRight = 30;
    const paddingTop = 35;
    const paddingBottom = 55;

    const chartWidth =
        canvas.width -
        paddingLeft -
        paddingRight;

    const chartHeight =
        canvas.height -
        paddingTop -
        paddingBottom;

    const allValues =
        algorithms.flatMap(
            algorithm =>
                (data[algorithm] || [])
                    .map(value =>
                        Number(value)
                    )
                    .filter(
                        value =>
                            Number.isFinite(
                                value
                            )
                    )
        );

    if (!allValues.length) {
        container.innerHTML =
            "<p>No convergence data available.</p>";
        return;
    }

    let minValue =
        Math.min(...allValues);

    let maxValue =
        Math.max(...allValues);

    if (minValue === maxValue) {
        minValue -= 1;
        maxValue += 1;
    } else {
        const range =
            maxValue - minValue;

        minValue -= range * 0.08;
        maxValue += range * 0.08;
    }

    const colors = {
        GA: "#2563eb",
        SA: "#16a34a",
        ACO: "#dc2626",
        PSO: "#9333ea",
        ABC: "#facc15"
    };

    function getX(index, length) {
        if (length <= 1) {
            return (
                paddingLeft +
                chartWidth / 2
            );
        }

        return (
            paddingLeft +
            (
                index /
                (length - 1)
            ) *
            chartWidth
        );
    }

    function getY(value) {
        return (
            paddingTop +
            (
                (maxValue - value) /
                (maxValue - minValue)
            ) *
            chartHeight
        );
    }

    ctx.font =
        "11px Arial";

    ctx.textAlign =
        "right";

    ctx.textBaseline =
        "middle";

    const ySteps = 5;

    for (
        let i = 0;
        i <= ySteps;
        i++
    ) {
        const value =
            maxValue -
            (
                i /
                ySteps
            ) *
            (
                maxValue -
                minValue
            );

        const y =
            paddingTop +
            (
                i /
                ySteps
            ) *
            chartHeight;

        ctx.strokeStyle =
            "#e5e7eb";

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.moveTo(
            paddingLeft,
            y
        );

        ctx.lineTo(
            canvas.width -
            paddingRight,
            y
        );

        ctx.stroke();

        ctx.fillStyle =
            "#667085";

        ctx.fillText(
            value.toFixed(2),
            paddingLeft - 10,
            y
        );
    }

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "top";

    const xLabels = 5;

    const longestLength =
        Math.max(
            ...algorithms.map(
                algorithm =>
                    (
                        data[algorithm] ||
                        []
                    ).length
            )
        );

    for (
        let i = 0;
        i <= xLabels;
        i++
    ) {
        const index =
            Math.round(
                (
                    i /
                    xLabels
                ) *
                Math.max(
                    longestLength - 1,
                    0
                )
            );

        const x =
            getX(
                index,
                Math.max(
                    longestLength,
                    1
                )
            );

        ctx.fillStyle =
            "#667085";

        ctx.fillText(
            index + 1,
            x,
            canvas.height -
            paddingBottom +
            12
        );
    }

    ctx.strokeStyle =
        "#9ca3af";

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
        paddingLeft,
        paddingTop
    );

    ctx.lineTo(
        paddingLeft,
        canvas.height -
        paddingBottom
    );

    ctx.lineTo(
        canvas.width -
        paddingRight,
        canvas.height -
        paddingBottom
    );

    ctx.stroke();

    algorithms.forEach(
        (
            algorithm,
            algorithmIndex
        ) => {
            const values =
                (
                    data[algorithm] ||
                    []
                )
                    .map(value =>
                        Number(value)
                    )
                    .filter(
                        value =>
                            Number.isFinite(
                                value
                            )
                    );

            if (!values.length) {
                return;
            }

            const lineColor = colors[algorithm] || "#64748b";

            ctx.beginPath();

            values.forEach(
                (
                    value,
                    index
                ) => {
                    const x =
                        getX(
                            index,
                            values.length
                        );

                    const y =
                        getY(
                            value
                        );

                    if (index === 0) {
                        ctx.moveTo(
                            x,
                            y
                        );
                    } else {
                        ctx.lineTo(
                            x,
                            y
                        );
                    }
                }
            );

            ctx.strokeStyle =
                lineColor;

            ctx.lineWidth = 2.5;

            ctx.stroke();

            values.forEach(
                (
                    value,
                    index
                ) => {
                    const x =
                        getX(
                            index,
                            values.length
                        );

                    const y =
                        getY(
                            value
                        );

                    ctx.beginPath();

                    ctx.arc(
                        x,
                        y,
                        2.5,
                        0,
                        Math.PI * 2
                    );

                    ctx.fillStyle =
                        lineColor;

                    ctx.fill();
                }
            );
        }
    );

    ctx.font =
        "12px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "alphabetic";

    ctx.fillStyle =
        "#111827";

    ctx.fillText(
        "Iteration / Generation",
        paddingLeft +
        chartWidth / 2,
        canvas.height - 10
    );

    ctx.save();

    ctx.translate(
        15,
        paddingTop +
        chartHeight / 2
    );

    ctx.rotate(
        -Math.PI / 2
    );

    ctx.fillStyle =
        "#111827";

    ctx.fillText(
        "Fitness",
        0,
        0
    );

    ctx.restore();

    let legendX =
        paddingLeft;

    const legendY = 15;

    ctx.font =
        "12px Arial";

    ctx.textAlign =
        "left";

    algorithms.forEach(
        (
            algorithm,
            algorithmIndex
        ) => {
            const lineColor = colors[algorithm] || "#64748b";

            ctx.fillStyle =
                lineColor;

            ctx.fillRect(
                legendX,
                legendY - 8,
                18,
                3
            );

            ctx.fillStyle =
                "#111827";

            ctx.fillText(
                algorithm,
                legendX + 24,
                legendY
            );

            legendX +=
                ctx.measureText(
                    algorithm
                ).width +
                60;
        }
    );
}

function clearRoutingResults() {
    const ids = [
        "routing-result",
        "routing-distance",
        "routing-fitness",
        "routing-time"
    ];

    ids.forEach(id => {
        const element =
            document.getElementById(
                id
            );

        if (element) {
            element.textContent =
                "—";
        }
    });
}

function clearCharts() {
    [
        "distance-chart",
        "time-chart",
        "convergence-chart"
    ].forEach(id => {
        const element =
            document.getElementById(
                id
            );

        if (element) {
            element.innerHTML =
                "<p>Run the comparison to generate results.</p>";
        }
    });
}

function clearPerformanceResults() {
    const content =
        document.getElementById(
            "sensitivity-content"
        );

    if (content) {
        content.textContent =
            "Select an algorithm and run the analysis.";
    }

    [
        "sensitivity-distance-chart",
        "sensitivity-time-chart"
    ].forEach(id => {
        const element =
            document.getElementById(
                id
            );

        if (element) {
            element.innerHTML =
                "<p>Select an algorithm and run the analysis.</p>";
        }
    });
}

function updatePerformanceParameter() {
    const algorithm =
        document.getElementById(
            "performance-algorithm"
        );

    const parameter =
        document.getElementById(
            "performance-parameter"
        );

    const hint =
        document.getElementById(
            "performance-hint"
        );

    if (!algorithm || !parameter) {
        return;
    }

    const parameters = {
        GA: [
            ["population_size", "Population Size", "10, 20, 30, 40, 50"],
            ["generations", "Generations", "20, 40, 60, 80, 100"],
            ["mutation_rate", "Mutation Rate", "0.01, 0.05, 0.10, 0.20, 0.30"]
        ],
        SA: [
            ["temperature", "Initial Temperature", "100, 300, 500, 700, 1000"],
            ["cooling_rate", "Cooling Rate", "0.80, 0.85, 0.90, 0.95, 0.99"],
            ["iterations", "Iterations", "50, 100, 150, 200, 300"]
        ],
        ACO: [
            ["ants", "Ants", "5, 10, 20, 30, 40"],
            ["iterations", "Iterations", "50, 100, 150, 200, 300"],
            ["evaporation", "Evaporation", "0.1, 0.3, 0.5, 0.7, 0.9"]
        ],
        PSO: [
            ["particles", "Particles", "5, 10, 20, 30, 40"],
            ["iterations", "Iterations", "50, 100, 150, 200, 300"],
            ["inertia", "Inertia", "0.4, 0.5, 0.6, 0.7, 0.8"]
        ],
        ABC: [
            ["bees", "Bees", "5, 10, 20, 30, 40"],
            ["iterations", "Iterations", "50, 100, 150, 200, 300"],
            ["limit", "Limit", "5, 10, 20, 30, 40"]
        ]
    };

    const selectedParameters =
        parameters[algorithm.value] || parameters.GA;

    parameter.innerHTML = selectedParameters
        .map(
            ([value, label]) =>
                `<option value="${value}">${label}</option>`
        )
        .join("");

    updatePerformanceValues();

    if (hint) {
        hint.textContent =
            "Enter values separated by commas.";
    }
}

function updatePerformanceValues() {
    const algorithm = document.getElementById(
        "performance-algorithm"
    );

    const parameter = document.getElementById(
        "performance-parameter"
    );

    const valuesInput = document.getElementById(
        "performance-values"
    );

    if (!algorithm || !parameter || !valuesInput) {
        return;
    }

    const examples = {
        GA: {
            population_size: "10, 20, 30, 40, 50",
            generations: "20, 40, 60, 80, 100",
            mutation_rate: "0.01, 0.05, 0.10, 0.20, 0.30"
        },
        SA: {
            temperature: "100, 300, 500, 700, 1000",
            cooling_rate: "0.80, 0.85, 0.90, 0.95, 0.99",
            iterations: "50, 100, 150, 200, 300"
        },
        ACO: {
            ants: "5, 10, 20, 30, 40",
            iterations: "50, 100, 150, 200, 300",
            evaporation: "0.1, 0.3, 0.5, 0.7, 0.9"
        },
        PSO: {
            particles: "5, 10, 20, 30, 40",
            iterations: "50, 100, 150, 200, 300",
            inertia: "0.4, 0.5, 0.6, 0.7, 0.8"
        },
        ABC: {
            bees: "5, 10, 20, 30, 40",
            iterations: "50, 100, 150, 200, 300",
            limit: "5, 10, 20, 30, 40"
        }
    };

    valuesInput.value =
        examples[algorithm.value]?.[parameter.value] || "";
}

async function runPerformanceAnalysis() {
    if (
        !generatedCities ||
        !Object.keys(generatedCities).length
    ) {
        alert(
            "Please load the network first."
        );
        return;
    }

    const algorithm =
        document.getElementById(
            "performance-algorithm"
        );

    const parameter =
        document.getElementById(
            "performance-parameter"
        );

    const valuesInput =
        document.getElementById(
            "performance-values"
        );

    if (
        !algorithm ||
        !parameter ||
        !valuesInput
    ) {
        return;
    }

    const values =
        valuesInput.value
            .split(",")
            .map(value =>
                Number(
                    value.trim()
                )
            )
            .filter(
                value =>
                    !Number.isNaN(
                        value
                    )
            );

    if (!values.length) {
        alert(
            "Enter valid parameter values."
        );
        return;
    }

    try {
        const response =
            await fetch(
                "/sensitivity",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify({
                            algorithm:
                                algorithm.value,
                            parameter:
                                parameter.value,
                            values:
                                values
                        })
                }
            );

        const data =
            await getJsonResponse(
                response
            );

        displayPerformanceResults(
            data
        );

    } catch (error) {
        alert(
            error.message
        );

        console.error(error);
    }
}

function displayPerformanceResults(data) {
    const content =
        document.getElementById(
            "sensitivity-content"
        );

    if (!content) {
        return;
    }

    const results =
        data.results || data.values || [];

    if (!results.length) {
        content.textContent =
            "No sensitivity results available.";
        return;
    }

    let html =
        `<table>
            <thead>
                <tr>
                    <th>Parameter</th>
                    <th>Distance</th>
                    <th>Execution Time</th>
                </tr>
            </thead>
            <tbody>`;

    results.forEach(item => {
        html += `
            <tr>
                <td>${item.parameter ?? item.value ?? "—"}</td>
                <td>${item.distance !== undefined ? Number(item.distance).toFixed(2) : "—"}</td>
                <td>${item.execution_time !== undefined ? Number(item.execution_time).toFixed(4) : "—"}</td>
            </tr>
        `;
    });

    html +=
        "</tbody></table>";

    content.innerHTML =
        html;

    drawSensitivityChart(
        "sensitivity-distance-chart",
        results,
        "distance",
        "Distance"
    );

    drawSensitivityChart(
        "sensitivity-time-chart",
        results,
        "execution_time",
        "Execution Time"
    );
}

function drawSensitivityChart(
    containerId,
    results,
    property,
    label
) {
    const container =
        document.getElementById(
            containerId
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!results.length) {
        container.innerHTML =
            "<p>No data available.</p>";
        return;
    }

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        Math.max(
            container.clientWidth,
            500
        );

    canvas.height = 320;

    container.appendChild(
        canvas
    );

    const ctx =
        canvas.getContext(
            "2d"
        );

    const padding = 45;

    const values =
        results.map(
            item =>
                Number(
                    item[property] ?? item.value
                ) || 0
        );

    const minDataValue = Math.min(...values);
    const maxDataValue = Math.max(...values);
    const dataRange = maxDataValue - minDataValue;
    const visibleRange =
        dataRange > 0
            ? dataRange
            : Math.max(Math.abs(maxDataValue) * 0.02, 1);
    const minValue =
        minDataValue - visibleRange * 0.08;
    const maxValue =
        maxDataValue + visibleRange * 0.08;
    const chartHeight = canvas.height - padding * 2;
    const chartWidth = canvas.width - padding * 2;

    function getX(index) {
        return padding +
            (index / Math.max(values.length - 1, 1)) * chartWidth;
    }

    function getY(value) {
        return canvas.height - padding -
            ((value - minValue) / (maxValue - minValue)) * chartHeight;
    }

    function formatValue(value) {
        if (Math.abs(value) >= 100) {
            return value.toFixed(1);
        }

        if (Math.abs(value) >= 1) {
            return value.toFixed(3);
        }

        return value.toFixed(4);
    }

    const ySteps = 5;

    ctx.font = "11px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let index = 0; index <= ySteps; index++) {
        const value = maxValue -
            (index / ySteps) * (maxValue - minValue);
        const y = padding + (index / ySteps) * chartHeight;

        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();

        ctx.fillStyle = "#667085";
        ctx.fillText(formatValue(value), padding - 8, y);
    }

    ctx.beginPath();

    values.forEach(
        (value, index) => {
            const x = getX(index);
            const y = getY(value);

            if (index === 0) {
                ctx.moveTo(
                    x,
                    y
                );
            } else {
                ctx.lineTo(
                    x,
                    y
                );
            }
        }
    );

    ctx.strokeStyle =
        "#2563eb";

    ctx.lineWidth = 2;

    ctx.stroke();

    values.forEach((value, index) => {
        ctx.beginPath();
        ctx.arc(getX(index), getY(value), 4, 0, Math.PI * 2);
        ctx.fillStyle = "#2563eb";
        ctx.fill();
    });

    ctx.strokeStyle =
        "#9ca3af";

    ctx.beginPath();

    ctx.moveTo(
        padding,
        padding
    );

    ctx.lineTo(
        padding,
        canvas.height -
            padding
    );

    ctx.lineTo(
        canvas.width -
            padding,
        canvas.height -
            padding
    );

    ctx.stroke();

    ctx.fillStyle =
        "#667085";

    ctx.font =
        "11px Arial";

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    results.forEach(
        (item, index) => {
            const x = getX(index);

            ctx.fillText(
                item.parameter ?? item.value ?? "",
                x,
                canvas.height -
                    padding +
                    18
            );
        }
    );

    ctx.fillText(
        label,
        8,
        padding
    );
}

function removePerformanceConvergence() {
    const convergence =
        document.getElementById(
            "performance-convergence"
        );

    if (convergence) {
        convergence.remove();
    }
}

function getSelectedApplicationAlgorithm(workspace) {
    if (!workspace) {
        return "GA";
    }

    const select = workspace.querySelector("select[id$='-algorithm']");

    if (select) {
        return select.value;
    }

    const selected =
        workspace.querySelector(
            ".algorithm-options button.selected"
        );

    return selected
        ? selected.dataset.algorithm
        : "GA";
}

function displaySchedulingJobs() {
    const table = document.getElementById("jobs-table");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    generatedJobs.forEach(job => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${job.id}</td>
            <td>${job.processing_time}</td>
            <td>${job.priority}</td>
            <td class="table-actions">
                <button type="button" class="edit-job-btn" data-job-id="${job.id}">Edit</button>
                <button type="button" class="remove-job-btn" data-job-id="${job.id}">Remove</button>
            </td>
        `;

        table.appendChild(row);
    });
}

function addSchedulingJob() {
    const form = document.getElementById("add-job-form");

    if (!form) {
        return;
    }

    const idInput = document.getElementById("job-id-input");
    const processingInput = document.getElementById("job-processing-input");
    const priorityInput = document.getElementById("job-priority-input");

    const id = idInput.value.trim();
    const processingTime = parseInt(processingInput.value);
    const priority = parseInt(priorityInput.value);

    if (!id) {
        alert("Enter a Job Name.");
        return;
    }

    if (generatedJobs.some(job => job.id === id && job.id !== editingJobId)) {
        alert("Job Name already exists.");
        return;
    }

    if (Number.isNaN(processingTime) || processingTime < 1) {
        alert("Enter a valid processing time.");
        return;
    }

    if (Number.isNaN(priority) || priority < 1) {
        alert("Enter a valid priority.");
        return;
    }

    const job = { id: id, processing_time: processingTime, priority: priority };
    const jobIndex = generatedJobs.findIndex(item => item.id === editingJobId);

    if (jobIndex >= 0) {
        generatedJobs[jobIndex] = job;
    } else {
        generatedJobs.push(job);
    }

    editingJobId = null;

    displaySchedulingJobs();

    idInput.value = "";
    processingInput.value = "";
    priorityInput.value = "";

    form.style.display = "none";
}

function editSchedulingJob(jobId) {
    const job = generatedJobs.find(item => item.id === jobId);
    const form = document.getElementById("add-job-form");

    if (!job || !form) {
        return;
    }

    editingJobId = jobId;
    document.getElementById("job-id-input").value = job.id;
    document.getElementById("job-processing-input").value = job.processing_time;
    document.getElementById("job-priority-input").value = job.priority;
    form.style.display = "flex";
}

function removeSchedulingJob(jobId) {
    generatedJobs = generatedJobs.filter(job => job.id !== jobId);
    if (editingJobId === jobId) {
        editingJobId = null;
        document.getElementById("add-job-form").style.display = "none";
    }
    displaySchedulingJobs();
}

async function runScheduling() {
    const workspace =
        document.getElementById(
            "scheduling-workspace"
        );

    const result =
        document.getElementById(
            "scheduling-result"
        );

    if (
        !workspace ||
        !result
    ) {
        return;
    }

    if (!generatedJobs.length) {
        alert("Please add at least one job.");
        return;
    }

    const algorithm =
        getSelectedApplicationAlgorithm(
            workspace
        );

    result.textContent =
        "Processing...";

    try {
        const response =
            await fetch(
                "/applications/scheduling",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify({
                            count:
                                generatedJobs.length,
                            algorithm:
                                algorithm,
                            jobs:
                                generatedJobs
                        })
                }
            );

        const data =
            await getJsonResponse(
                response
            );

        displaySchedulingData(
            data
        );

    } catch (error) {
        result.textContent =
            error.message;

        console.error(
            error
        );
    }
}

function displaySchedulingData(data) {
    const result =
        document.getElementById(
            "scheduling-result"
        );

    if (!result) {
        return;
    }

    const jobs =
        data.jobs || generatedJobs || [];

    const schedule =
        data.schedule || [];

    if (!schedule.length || !jobs.length) {
        result.textContent =
            "No optimized schedule available.";

        return;
    }

    const jobMap = {};

    jobs.forEach(job => {
        jobMap[job.id || job.job] = job;
    });

    let currentTime = 0;

    const optimizedJobs =
        schedule.map((item, index) => {
            const taskId =
                typeof item === "string"
                    ? item
                    : item.id ||
                      item.job ||
                      item.task;

            const job =
                jobMap[taskId] || {};

            const duration =
                Number(
                    job.processing_time ??
                    job.duration ??
                    item.processing_time ??
                    item.duration ??
                    1
                );

            const startTime =
                Number(
                    item.start_time ??
                    item.startTime ??
                    currentTime
                );

            const completionTime =
                Number(
                    item.completion_time ??
                    item.completionTime ??
                    startTime + duration
                );

            currentTime =
                completionTime;

            return {
                sequence:
                    index + 1,
                task:
                    taskId || "—",
                startTime:
                    startTime,
                completionTime:
                    completionTime,
                priority:
                    job.priority ??
                    item.priority ??
                    "—",
                duration:
                    duration
            };
        });

    result.innerHTML = `
        <h3>Optimized Schedule</h3>

        <div class="schedule-table-container">
            <table class="schedule-result-table">
                <thead>
                    <tr>
                        <th>Sequence</th>
                        <th>Task</th>
                        <th>Start Time</th>
                        <th>Completion Time</th>
                        <th>Priority</th>
                    </tr>
                </thead>
                <tbody>
                    ${optimizedJobs.map(job => `
                        <tr>
                            <td>${job.sequence}</td>
                            <td>${job.task}</td>
                            <td>${job.startTime}</td>
                            <td>${job.completionTime}</td>
                            <td>${job.priority}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;

    drawSchedulingGantt(
        data.gantt || optimizedJobs
    );
}

function drawSchedulingGantt(schedule) {
    const gantt =
        document.getElementById(
            "gantt-chart"
        );

    if (!gantt) {
        return;
    }

    const jobsMap = {};

    generatedJobs.forEach(
        job => {
            jobsMap[job.id] =
                Number(
                    job.processing_time
                );
        }
    );

    const scheduleData =
        schedule.map(
            item => {
                if (
                    typeof item ===
                    "string"
                ) {
                    return {
                        id: item,
                        processingTime:
                            jobsMap[item] ||
                            1
                    };
                }

                const id =
                    item.id ||
                    item.job_id ||
                    item.task;

                const processingTime =
                    Number(
                        item.processing_time ||
                        item.duration ||
                        item.time ||
                        jobsMap[id] ||
                        1
                    );

                return {
                    id:
                        id,
                    processingTime:
                        processingTime
                };
            }
        );

    let currentTime = 0;

    scheduleData.forEach(
        job => {
            job.startTime =
                currentTime;

            job.endTime =
                currentTime +
                job.processingTime;

            currentTime =
                job.endTime;
        }
    );

    const totalTime =
        currentTime;

    if (!totalTime) {
        gantt.innerHTML =
            "<p>No Gantt data available.</p>";
        return;
    }

    let scaleHTML = "";

    for (
        let i = 0;
        i <= totalTime;
        i++
    ) {
        scaleHTML +=
            `<span>${i}</span>`;
    }

    let rowsHTML = "";

    scheduleData.forEach(
        job => {
            const left =
                (
                    job.startTime /
                    totalTime
                ) *
                100;

            const width =
                (
                    job.processingTime /
                    totalTime
                ) *
                100;

            rowsHTML += `
                <div class="gantt-row">
                    <div class="gantt-task-label">
                        ${job.id}
                    </div>

                    <div class="gantt-track">
                        <div
                            class="gantt-bar"
                            style="left:${left}%;width:${width}%;">
                            ${job.id}
                            <span class="gantt-time">
                                ${job.startTime} - ${job.endTime}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }
    );

    gantt.innerHTML = `
        <div class="gantt-wrapper">

            <div class="gantt-timeline">
                <div class="gantt-label-header">
                    Task
                </div>

                <div class="gantt-scale">
                    ${scaleHTML}
                </div>
            </div>

            ${rowsHTML}

        </div>
    `;
}

function displayFeatureList() {
    const container =
        document.getElementById(
            "feature-list"
        );

    if (!container) {
        return;
    }

    container.innerHTML = generatedFeatures.map(feature => `
        <tr>
            <td>${feature.id}</td>
            <td>${Number(feature.relevance).toFixed(2)}</td>
            <td class="table-actions">
                <button type="button" class="edit-feature-btn" data-feature-id="${feature.id}">Edit</button>
                <button type="button" class="remove-feature-btn" data-feature-id="${feature.id}">Remove</button>
            </td>
        </tr>
    `).join("");
}

let editingFeatureId = null;

function addFeature() {
    const nameInput =
        document.getElementById(
            "feature-name-input"
        );

    const relevanceInput =
        document.getElementById(
            "feature-relevance-input"
        );

    if (!nameInput || !relevanceInput) {
        return;
    }

    const name =
        nameInput.value.trim();

    const relevance =
        parseFloat(
            relevanceInput.value
        );

    if (!name) {
        alert("Enter a feature name.");
        return;
    }

    if (
        Number.isNaN(relevance) ||
        relevance < 0 ||
        relevance > 1
    ) {
        alert(
            "Enter relevance between 0 and 1."
        );
        return;
    }

    const exists =
        generatedFeatures.some(
            feature =>
                feature.id.toLowerCase() ===
                    name.toLowerCase() && feature.id !== editingFeatureId
        );

    if (exists) {
        alert(
            "This feature already exists."
        );
        return;
    }

    const feature = { id: name, relevance: relevance };
    const featureIndex = generatedFeatures.findIndex(item => item.id === editingFeatureId);

    if (featureIndex >= 0) {
        generatedFeatures[featureIndex] = feature;
    } else {
        generatedFeatures.push(feature);
    }

    editingFeatureId = null;

    nameInput.value = "";
    relevanceInput.value = "";

    displayFeatureList();
    document.getElementById("add-feature-form").style.display = "none";
}

function editFeature(featureId) {
    const feature = generatedFeatures.find(item => item.id === featureId);
    const form = document.getElementById("add-feature-form");

    if (!feature || !form) {
        return;
    }

    editingFeatureId = featureId;
    document.getElementById("feature-name-input").value = feature.id;
    document.getElementById("feature-relevance-input").value = feature.relevance;
    form.style.display = "flex";
}

function removeFeature(featureId) {
    generatedFeatures = generatedFeatures.filter(
        feature => feature.id !== featureId
    );

    if (editingFeatureId === featureId) {
        editingFeatureId = null;
    }

    displayFeatureList();
}

async function runFeatureSelection() {
    const workspace =
        document.getElementById(
            "feature-selection-workspace"
        );

    const problemInput =
        document.getElementById(
            "feature-problem"
        );

    const resultAlgorithm =
        document.getElementById(
            "feature-result-algorithm"
        );

    const resultTotal =
        document.getElementById(
            "feature-result-total"
        );

    const resultSelected =
        document.getElementById(
            "feature-result-selected"
        );

    const resultFitness =
        document.getElementById(
            "feature-result-fitness"
        );

    const resultRedundancy =
        document.getElementById(
            "feature-result-redundancy"
        );

    const resultTime =
        document.getElementById(
            "feature-result-time"
        );

    const reason =
        document.getElementById(
            "feature-reason-text"
        );

    if (!workspace) {
        return;
    }

    if (!generatedFeatures.length) {
        alert("Add at least one feature before optimizing.");
        return;
    }

    const algorithm =
        getSelectedApplicationAlgorithm(
            workspace
        );

    if (resultAlgorithm) {
        resultAlgorithm.textContent =
            algorithm;
    }

    if (resultTotal) {
        resultTotal.textContent =
            generatedFeatures.length;
    }

    if (resultSelected) {
        resultSelected.textContent =
            "Processing...";
    }

    try {
        const response = await fetch(
            "/applications/feature_selection",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    algorithm: algorithm,
                    problem:
                        problemInput
                            ? problemInput.value.trim()
                            : "",
                    features:
                        generatedFeatures
                })
            }
        );

        const data =
            await getJsonResponse(response);

        displayFeatureSelectionData(data);

    } catch (error) {
        if (resultSelected) {
            resultSelected.textContent =
                "Error";
        }

        console.error(error);
    }
}

function displayFeatureSelectionData(data) {
    const resultAlgorithm =
        document.getElementById(
            "feature-result-algorithm"
        );

    const resultTotal =
        document.getElementById(
            "feature-result-total"
        );

    const resultSelected =
        document.getElementById(
            "feature-result-selected"
        );

    const resultFitness =
        document.getElementById(
            "feature-result-fitness"
        );

    const resultRedundancy =
        document.getElementById(
            "feature-result-redundancy"
        );

    const resultTime =
        document.getElementById(
            "feature-result-time"
        );

    const reason =
        document.getElementById(
            "feature-reason-text"
        );

    const selectedFeatures =
        Array.isArray(
            data.selected_features
        )
            ? data.selected_features
            : [];

    if (resultAlgorithm) {
        resultAlgorithm.textContent =
            data.algorithm || "—";
    }

    if (resultTotal) {
        resultTotal.textContent =
            data.features
                ? data.features.length
                : generatedFeatures.length;
    }

    if (resultSelected) {
        resultSelected.textContent =
            selectedFeatures.length
                ? selectedFeatures
                    .map(feature =>
                        typeof feature === "object"
                            ? feature.id
                            : feature
                    )
                    .join(", ")
                : "None";
    }

    if (resultFitness) {
        resultFitness.textContent =
            data.fitness !== undefined
                ? Number(data.fitness).toFixed(4)
                : "—";
    }

    if (resultRedundancy) {
        resultRedundancy.textContent =
            data.redundancy !== undefined
                ? Number(data.redundancy).toFixed(3)
                : "—";
    }

    if (resultTime) {
        resultTime.textContent =
            data.execution_time !== undefined
                ? `${Number(data.execution_time).toFixed(6)} s`
                : "—";
    }

    if (reason) {
        reason.textContent =
            data.reason ||
            "The selected feature subset was obtained using relevance, subset size and redundancy.";
    }
}

function addNewTimetableClass() {
    const classInput = document.getElementById("new-class-id");
    const teacherInput = document.getElementById("new-teacher-id");
    const slotInput = document.getElementById("new-class-slot");

    if (!classInput || !teacherInput || !slotInput) {
        return;
    }

    const classId = classInput.value.trim();
    const teacher = teacherInput.value.trim();
    const preferredSlot = slotInput.value;
    const [day, time] = preferredSlot.split(" ");

    if (!classId || !teacher || !preferredSlot) {
        alert("Please enter all class details.");
        return;
    }

    const exists = generatedClasses.some(
        classData => classData.id === classId && classData.id !== editingClassId
    );

    if (exists) {
        alert("Class ID already exists.");
        return;
    }

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
    ];

    const times = [
        "09:00-10:00",
        "10:00-11:00",
        "11:15-12:15"
    ];

    const classData = {
        id: classId,
        teacher: teacher,
        preferred_slot: preferredSlot,
        slot:
            days.indexOf(day) * times.length +
            times.indexOf(time)
    };

    const classIndex = generatedClasses.findIndex(
        classData => classData.id === editingClassId
    );

    if (classIndex >= 0) {
        generatedClasses[classIndex] = classData;
    } else {
        generatedClasses.push(classData);
    }

    editingClassId = null;

    displayTimetableInputData(generatedClasses);
    updateTimetableConstraints();

    classInput.value = "";
    teacherInput.value = "";

    const form = document.getElementById("add-class-form");

    if (form) {
        form.classList.add("hidden");
    }

    const saveButton = document.getElementById("save-class-btn");
    if (saveButton) {
        saveButton.textContent = "Add";
    }

    openTimetableConstraints();
}

function editTimetableClass(classId) {
    const classData = generatedClasses.find(item => item.id === classId);
    const form = document.getElementById("add-class-form");

    if (!classData || !form) {
        return;
    }

    editingClassId = classId;
    document.getElementById("new-class-id").value = classData.id;
    document.getElementById("new-teacher-id").value = classData.teacher;
    document.getElementById("new-class-slot").value = classData.preferred_slot;
    document.getElementById("save-class-btn").textContent = "Save Changes";
    form.classList.remove("hidden");
}

function removeTimetableClass(classId) {
    generatedClasses = generatedClasses.filter(
        classData => classData.id !== classId
    );

    if (editingClassId === classId) {
        editingClassId = null;
    }

    displayTimetableInputData(generatedClasses);
    updateTimetableConstraints();
}

function openTimetableConstraints() {
    const constraintTab = document.querySelector(
        '[data-timetable-section="constraints"]'
    );

    const sections = document.querySelectorAll(
        ".timetabling-section"
    );

    if (constraintTab) {
        document.querySelectorAll(
            '[data-timetable-section]'
        ).forEach(button => {
            button.classList.remove("active");
        });

        constraintTab.classList.add("active");
    }

    sections.forEach(section => {
        section.classList.remove("active");
    });

    const constraints = document.getElementById(
        "constraints-section"
    );

    if (constraints) {
        constraints.classList.add("active");
    }
}

function updateTimetableConstraints() {
    const teacherSlots = {};
    const timeSlots = {};
    let teacherConflictCount = 0;
    let timeConflictCount = 0;

    generatedClasses.forEach(classData => {
        const timeKey = classData.preferred_slot;
        const teacherKey = `${classData.teacher}-${timeKey}`;

        if (teacherSlots[teacherKey]) {
            teacherConflictCount++;
        }

        if (timeSlots[timeKey]) {
            timeConflictCount++;
        }

        teacherSlots[teacherKey] = true;
        timeSlots[timeKey] = true;
    });

    const teacherConflict = document.getElementById("teacher-conflicts");
    const timeConflict = document.getElementById("time-conflicts");

    if (teacherConflict) {
        teacherConflict.textContent = teacherConflictCount;
    }

    if (timeConflict) {
        timeConflict.textContent = timeConflictCount;
    }
}

async function generateTimetableData() {
    const classInput =
        document.getElementById(
            "class-count"
        );

    const teacherInput =
        document.getElementById(
            "teacher-count"
        );

    const table =
        document.getElementById(
            "predefined-classes-table"
        );

    if (
        !classInput ||
        !teacherInput ||
        !table
    ) {
        return;
    }

    const numberOfClasses =
        parseInt(
            classInput.value
        );

    const numberOfTeachers =
        parseInt(
            teacherInput.value
        );

    if (
        Number.isNaN(
            numberOfClasses
        ) ||
        numberOfClasses < 2 ||
        numberOfClasses > 30
    ) {
        alert(
            "Enter the number of classes between 2 and 30."
        );
        return;
    }

    if (
        Number.isNaN(
            numberOfTeachers
        ) ||
        numberOfTeachers < 1 ||
        numberOfTeachers > numberOfClasses
    ) {
        alert(
            "Number of teachers must be between 1 and the number of classes."
        );
        return;
    }

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
    ];

    const times = [
        "09:00-10:00",
        "10:00-11:00",
        "11:15-12:15"
    ];

    table.innerHTML = "";

    generatedClasses = [];

    for (
        let i = 1;
        i <= numberOfClasses;
        i++
    ) {
        const day =
            days[
                Math.floor(
                    Math.random() * days.length
                )
            ];

        const time =
            times[
                Math.floor(
                    Math.random() * times.length
                )
            ];

        const classData = {
            id: `C${i}`,
            teacher:
                `T${
                    Math.floor(
                        Math.random() *
                        numberOfTeachers
                    ) + 1
                }`,
            preferred_slot:
                `${day} ${time}`,
            slot:
                days.indexOf(day) *
                times.length +
                times.indexOf(time)
        };

        generatedClasses.push(
            classData
        );

        const row =
            document.createElement(
                "tr"
            );

        row.innerHTML = `
            <td>${classData.id}</td>
            <td>${classData.teacher}</td>
            <td>${classData.preferred_slot}</td>
            <td>
                <button
                    type="button"
                    class="edit-class-btn"
                    data-class-id="${classData.id}"
                >
                    Edit
                </button>
                <button
                    type="button"
                    class="remove-class-btn"
                    data-class-id="${classData.id}"
                >
                    Remove
                </button>
            </td>
        `;

        table.appendChild(
            row
        );
    }

    updateTimetableConstraints();

    const result =
        document.getElementById(
            "timetable-grid"
        );

    if (result) {
        result.innerHTML = "";
    }

    const summary =
        document.getElementById(
            "timetable-summary"
        );

    if (summary) {
        summary.textContent =
            "Timetable data generated. Select an algorithm and optimize.";
    }
}

async function runTimetabling() {
    const workspace =
        document.getElementById(
            "timetabling-workspace"
        );

    if (
        !workspace ||
        !generatedClasses.length
    ) {
        alert(
            "Please add or load timetable classes first."
        );
        return;
    }

    const numberOfClasses =
        generatedClasses.length;

    const numberOfTeachers =
        new Set(
            generatedClasses.map(
                classData =>
                    classData.teacher
            )
        ).size;

    const algorithm =
        getSelectedApplicationAlgorithm(
            workspace
        );

    try {
        const response =
            await fetch(
                "/applications/timetabling",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify({
                            count:
                                numberOfClasses,
                            algorithm:
                                algorithm,
                            teacher_count:
                                numberOfTeachers,
                            classes:
                                generatedClasses
                        })
                }
            );

        const data =
            await getJsonResponse(
                response
            );

        displayTimetable(
            data.timetable ||
            []
        );

        displayChangedClasses(data.changes || []);

        displayTimetableInputData(
            data.classes ||
            generatedClasses
        );

        const fitness =
            document.getElementById(
                "timetable-fitness"
            );

        const conflicts = document.getElementById("timetable-result-conflicts");

        const executionTime =
            document.getElementById(
                "timetable-time"
            );

        if (fitness) {
            fitness.textContent =
                data.fitness !== undefined
                    ? Number(
                        data.fitness
                    ).toFixed(2)
                    : "—";
        }

        if (conflicts) {
            conflicts.textContent =
                data.conflicts !== undefined
                    ? data.conflicts
                    : "—";
        }

                updateOptimizedTimetableConstraints(data.timetable || []);

        if (executionTime) {
            executionTime.textContent =
                data.execution_time !== undefined
                    ? `${Number(
                        data.execution_time
                    ).toFixed(4)} sec`
                    : "—";
        }

    } catch (error) {
        console.error(
            error
        );

        alert(
            error.message
        );
    }
}

function displayTimetableInputData(classes) {
    const tableBody =
        document.getElementById(
            "predefined-classes-table"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    if (!classes.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    No timetable data available.
                </td>
            </tr>
        `;

        return;
    }

    classes.forEach(
        classData => {
            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML = `
                <td>${classData.id || "—"}</td>
                <td>${classData.teacher || "—"}</td>
                <td>${classData.preferred_slot || "—"}</td>
                <td>
                    <button
                        type="button"
                        class="edit-class-btn"
                        data-class-id="${classData.id}"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        class="remove-class-btn"
                        data-class-id="${classData.id}"
                    >
                        Remove
                    </button>
                </td>
            `;

            tableBody.appendChild(
                row
            );
        }
    );
}

function displayTimetable(data) {
    const tableBody =
        document.getElementById(
            "timetable-grid"
        );

    const summary =
        document.getElementById(
            "timetable-summary"
        );

    const fitness =
        document.getElementById(
            "timetable-fitness"
        );

    const conflicts =
        document.getElementById(
            "teacher-conflicts"
        );

    const time =
        document.getElementById(
            "timetable-time"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    if (!data.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No timetable generated.
                </td>
            </tr>
        `;

        return;
    }

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
    ];

    const times = [
        "09:00-10:00",
        "10:00-11:00",
        "11:15-12:15"
    ];

    if (summary) {
        summary.textContent =
            "Timetable optimized successfully.";
    }

    times.forEach(
        timeSlot => {
            const row =
                document.createElement(
                    "tr"
                );

            const cells =
                days.map(
                    day => {
                        const slot =
                            data.find(
                                item =>
                                    item.day === day &&
                                    item.time === timeSlot
                            );

                        return slot
                            ? `${slot.class || "—"} (${slot.teacher || "—"})`
                            : "—";
                    }
                );

            row.innerHTML = [
                `<td>${timeSlot}</td>`,
                ...cells.map(
                    cell =>
                        `<td>${cell}</td>`
                )
            ].join("");

            tableBody.appendChild(
                row
            );
        }
    );
}

function displayChangedClasses(changes) {
    const container = document.getElementById("changed-classes");

    if (!container) {
        return;
    }

    if (!changes.length) {
        container.textContent = "No classes changed slots.";
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Class</th>
                    <th>Teacher</th>
                    <th>Original Slot</th>
                    <th>Optimized Slot</th>
                </tr>
            </thead>
            <tbody>
                ${changes.map(change => `
                    <tr>
                        <td>${change.class || "—"}</td>
                        <td>${change.teacher || "—"}</td>
                        <td>${change.original_slot || "—"}</td>
                        <td>${change.optimized_slot || "—"}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

function updateOptimizedTimetableConstraints(timetable) {
    const teacherSlots = {};
    const timeSlots = {};
    let teacherConflictCount = 0;
    let timeConflictCount = 0;

    timetable.forEach(item => {
        const timeKey = `${item.day} ${item.time}`;
        const teacherKey = `${item.teacher}-${timeKey}`;

        if (teacherSlots[teacherKey]) {
            teacherConflictCount++;
        }

        if (timeSlots[timeKey]) {
            timeConflictCount++;
        }

        teacherSlots[teacherKey] = true;
        timeSlots[timeKey] = true;
    });

    const teacherConflict = document.getElementById("teacher-conflicts");
    const timeConflict = document.getElementById("time-conflicts");

    if (teacherConflict) {
        teacherConflict.textContent = teacherConflictCount;
    }

    if (timeConflict) {
        timeConflict.textContent = timeConflictCount;
    }
}