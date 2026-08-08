/* =========================================================
   MELLO — SCRIPT
   ========================================================= */

const STORAGE_KEY = "mello-v1";


/* =========================================================
   DATA
   ========================================================= */

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (error) {
            console.warn("Mello data could not be loaded.");
        }
    }

    return {
        daily: {},
        monthly: {},
        personal: [],
        career: [],
        notes: ""
    };
}

const data = loadData();


function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


/* =========================================================
   DATE STATE
   ========================================================= */

const now = new Date();

const realToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
);

let selectedDate = new Date(realToday);


/* =========================================================
   DATE HELPERS
   ========================================================= */

function pad(number) {
    return String(number).padStart(2, "0");
}


function dateKey(date) {
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
    ].join("-");
}


function monthKey(date) {
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1)
    ].join("-");
}


function daysInMonth(year, month) {
    return new Date(
        year,
        month + 1,
        0
    ).getDate();
}


function isSameDate(dateA, dateB) {
    return dateKey(dateA) === dateKey(dateB);
}


/* =========================================================
   DAILY TASK DATA
   ========================================================= */

function getDailyTasks(date) {

    const key = dateKey(date);

    if (!data.daily[key]) {
        data.daily[key] = [
            {
                text: "",
                completed: false
            },
            {
                text: "",
                completed: false
            },
            {
                text: "",
                completed: false
            }
        ];
    }

    return data.daily[key];
}


/* =========================================================
   MONTHLY DATA
   ========================================================= */

function getMonthlyData(date) {

    const key = monthKey(date);

    if (!data.monthly[key]) {

        data.monthly[key] = {

            goals: [
                {
                    text: "",
                    completed: false
                },
                {
                    text: "",
                    completed: false
                },
                {
                    text: "",
                    completed: false
                }
            ],

            todo: [
                {
                    text: "",
                    completed: false
                },
                {
                    text: "",
                    completed: false
                },
                {
                    text: "",
                    completed: false
                }
            ]
        };
    }

    return data.monthly[key];
}


/* =========================================================
   PROGRESS
   ========================================================= */

function calculateProgress(tasks) {

    const actualTasks = tasks.filter(
        task => task.text.trim() !== ""
    );

    if (actualTasks.length === 0) {
        return 0;
    }

    const completed = actualTasks.filter(
        task => task.completed
    ).length;

    return Math.round(
        (completed / actualTasks.length) * 100
    );
}


/* =========================================================
   MONTHLY PROGRESS
   ========================================================= */

function calculateMonthlyProgress(date) {

    const year = date.getFullYear();
    const month = date.getMonth();

    let total = 0;
    let completed = 0;

    for (
        let day = 1;
        day <= daysInMonth(year, month);
        day++
    ) {

        const currentDate = new Date(
            year,
            month,
            day
        );

        const tasks =
            data.daily[dateKey(currentDate)] || [];

        tasks.forEach(task => {

            if (task.text.trim() !== "") {

                total++;

                if (task.completed) {
                    completed++;
                }
            }
        });
    }

    if (total === 0) {
        return {
            total: 0,
            completed: 0,
            left: 0,
            percentage: 0
        };
    }

    return {
        total,
        completed,
        left: total - completed,
        percentage: Math.round(
            (completed / total) * 100
        )
    };
}


/* =========================================================
   DESKTOP CALENDAR
   ========================================================= */

function renderDesktopCalendar() {

    const grid =
        document.getElementById("calendarGrid");

    const weekdays =
        document.getElementById("weekdays");

    if (!grid || !weekdays) {
        return;
    }

    grid.innerHTML = "";
    weekdays.innerHTML = "";

    const weekdayNames = [
        "SUN",
        "MON",
        "TUE",
        "WED",
        "THU",
        "FRI",
        "SAT"
    ];

    weekdayNames.forEach(day => {

        const element =
            document.createElement("div");

        element.className = "weekday";
        element.textContent = day;

        weekdays.appendChild(element);
    });


    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDay = new Date(
        year,
        month,
        1
    ).getDay();

    const totalDays = daysInMonth(
        year,
        month
    );


    /* Empty cells before first day */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-day empty-day";

        grid.appendChild(empty);
    }


    /* Actual days */

    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {

        const date = new Date(
            year,
            month,
            day
        );

        const key = dateKey(date);

        const tasks = getDailyTasks(date);

        const cell =
            document.createElement("div");

        cell.className =
            "calendar-day";


        if (isSameDate(date, realToday)) {
            cell.classList.add("today");
        }


        if (isSameDate(date, selectedDate)) {
            cell.classList.add("selected");
        }


        /* Date header */

        const header =
            document.createElement("div");

        header.className =
            "date-header";

        const dateNumber =
            document.createElement("span");

        dateNumber.textContent = day;

        header.appendChild(dateNumber);


        if (isSameDate(date, realToday)) {

            const todayLabel =
                document.createElement("span");

            todayLabel.className =
                "today-label";

            todayLabel.textContent =
                "TODAY";

            header.appendChild(todayLabel);
        }


        /* Task area */

        const taskArea =
            document.createElement("div");

        taskArea.className =
            "day-tasks";


        tasks.forEach((task, index) => {

            const taskRow =
                createDesktopTask(
                    key,
                    index,
                    task
                );

            taskArea.appendChild(taskRow);
        });


        /* Add task */

        const addButton =
            document.createElement("button");

        addButton.className =
            "add-task";

        addButton.textContent =
            "+ add task";


        addButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                tasks.push({
                    text: "",
                    completed: false
                });

                saveData();

                renderAll();

                requestAnimationFrame(() => {

                    const inputs =
                        cell.querySelectorAll(
                            ".task-input"
                        );

                    if (inputs.length) {
                        inputs[
                            inputs.length - 1
                        ].focus();
                    }
                });
            }
        );


        taskArea.appendChild(addButton);


        /* Progress */

        const progress =
            calculateProgress(tasks);

        const progressContainer =
            document.createElement("div");

        progressContainer.className =
            "day-progress";

        const progressBar =
            document.createElement("div");

        progressBar.className =
            "day-progress-bar";

        const progressFill =
            document.createElement("div");

        progressFill.className =
            "day-progress-fill";

        progressFill.style.width =
            `${progress}%`;

        progressBar.appendChild(
            progressFill
        );

        progressContainer.appendChild(
            progressBar
        );


        cell.appendChild(header);
        cell.appendChild(taskArea);
        cell.appendChild(progressContainer);


        /* Select date */

        cell.addEventListener(
            "click",
            () => {

                selectedDate =
                    new Date(date);

                renderAll();
            }
        );


        grid.appendChild(cell);
    }
}


/* =========================================================
   DESKTOP TASK
   ========================================================= */

function createDesktopTask(
    key,
    index,
    task
) {

    const row =
        document.createElement("div");

    row.className =
        "task-row";


    if (task.completed) {
        row.classList.add("completed");
    }


    const checkbox =
        document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;


    const input =
        document.createElement("input");

    input.type = "text";
    input.className = "task-input";

    input.value = task.text;
    input.placeholder = "task...";


    checkbox.addEventListener(
        "click",
        event => {
            event.stopPropagation();
        }
    );


    checkbox.addEventListener(
        "change",
        event => {

            event.stopPropagation();

            data.daily[key][index].completed =
                checkbox.checked;

            saveData();

            renderAll();
        }
    );


    input.addEventListener(
        "click",
        event => {
            event.stopPropagation();
        }
    );


    input.addEventListener(
        "input",
        () => {

            data.daily[key][index].text =
                input.value;

            saveData();
        }
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                input.blur();
            }
        }
    );


    row.appendChild(checkbox);
    row.appendChild(input);

    return row;
}


/* =========================================================
   MOBILE DAY
   ========================================================= */

function renderMobileDay() {

    const mobileDate =
        document.getElementById("mobileDate");

    const mobileWeekday =
        document.getElementById("mobileWeekday");

    const mobileDayTitle =
        document.getElementById("mobileDayTitle");

    const mobileTasks =
        document.getElementById("mobileTasks");


    if (!mobileTasks) {
        return;
    }


    mobileDate.textContent =
        selectedDate.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric"
            }
        );


    mobileWeekday.textContent =
        selectedDate.toLocaleDateString(
            "en-US",
            {
                weekday: "long"
            }
        );


    mobileDayTitle.textContent =
        selectedDate.toLocaleDateString(
            "en-US",
            {
                weekday: "long"
            }
        );


    const tasks =
        getDailyTasks(selectedDate);


    mobileTasks.innerHTML = "";


    tasks.forEach(
        (task, index) => {

            const row =
                document.createElement("div");

            row.className =
                "mobile-task";


            if (task.completed) {
                row.classList.add("completed");
            }


            const checkbox =
                document.createElement("input");

            checkbox.type = "checkbox";

            checkbox.checked =
                task.completed;


            const input =
                document.createElement("input");

            input.type = "text";

            input.value =
                task.text;

            input.placeholder =
                "Add a task...";


            checkbox.addEventListener(
                "change",
                () => {

                    tasks[index].completed =
                        checkbox.checked;

                    saveData();

                    renderAll();
                }
            );


            input.addEventListener(
                "input",
                () => {

                    tasks[index].text =
                        input.value;

                    saveData();

                    updateProgressOnly();
                }
            );


            row.appendChild(checkbox);
            row.appendChild(input);

            mobileTasks.appendChild(row);
        }
    );


    updateMobileProgress();
}


/* =========================================================
   MOBILE PROGRESS
   ========================================================= */

function updateMobileProgress() {

    const tasks =
        getDailyTasks(selectedDate);

    const percentage =
        calculateProgress(tasks);


    const progressText =
        document.getElementById(
            "mobileProgress"
        );

    const progressFill =
        document.getElementById(
            "mobileProgressFill"
        );

    if (progressText) {

        progressText.textContent =
            `${percentage}%`;
    }


    if (progressFill) {

        progressFill.style.width =
            `${percentage}%`;
    }


    const progressCircle =
        document.querySelector(
            ".mobile-day-progress"
        );

    if (progressCircle) {

        progressCircle.style.setProperty(
            "--mobile-progress",
            `${percentage}%`
        );
    }
}


function updateProgressOnly() {

    updateMobileProgress();

    updateDesktopProgress();
}


/* =========================================================
   DESKTOP PROGRESS
   ========================================================= */

function updateDesktopProgress() {

    const progress =
        calculateMonthlyProgress(
            selectedDate
        );


    const percentage =
        progress.percentage;


    const desktopProgress =
        document.getElementById(
            "desktopProgress"
        );

    const desktopTotal =
        document.getElementById(
            "desktopTotal"
        );

    const desktopDone =
        document.getElementById(
            "desktopDone"
        );

    const desktopLeft =
        document.getElementById(
            "desktopLeft"
        );

    const circle =
        document.getElementById(
            "desktopProgressCircle"
        );


    if (desktopProgress) {
        desktopProgress.textContent =
            `${percentage}%`;
    }

    if (desktopTotal) {
        desktopTotal.textContent =
            progress.total;
    }

    if (desktopDone) {
        desktopDone.textContent =
            progress.completed;
    }

    if (desktopLeft) {
        desktopLeft.textContent =
            progress.left;
    }

    if (circle) {

        circle.style.setProperty(
            "--progress",
            `${percentage}%`
        );
    }
}


/* =========================================================
   MONTHLY LISTS
   ========================================================= */

function renderLists() {

    const monthly =
        getMonthlyData(selectedDate);


    renderList(
        "desktopGoals",
        monthly.goals
    );

    renderList(
        "mobileGoals",
        monthly.goals
    );


    renderList(
        "desktopTodo",
        monthly.todo
    );

    renderList(
        "mobileTodo",
        monthly.todo
    );


    renderList(
        "desktopPersonal",
        data.personal
    );

    renderList(
        "mobilePersonal",
        data.personal
    );


    renderList(
        "desktopCareer",
        data.career
    );

    renderList(
        "mobileCareer",
        data.career
    );


    const drawerMonth =
        document.getElementById(
            "drawerMonth"
        );


    if (drawerMonth) {

        drawerMonth.textContent =
            selectedDate.toLocaleDateString(
                "en-US",
                {
                    month: "long",
                    year: "numeric"
                }
            );
    }
}


/* =========================================================
   GENERIC LIST RENDERER
   ========================================================= */

function renderList(
    elementId,
    list
) {

    const container =
        document.getElementById(
            elementId
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    list.forEach(
        (item, index) => {

            const row =
                document.createElement("div");

            row.className =
                "list-item";


            if (item.completed) {
                row.classList.add("completed");
            }


            const checkbox =
                document.createElement("input");

            checkbox.type = "checkbox";

            checkbox.className =
                "list-check";

            checkbox.checked =
                item.completed;


            const input =
                document.createElement("input");

            input.type = "text";

            input.className =
                "list-input";

            input.value =
                item.text;

            input.placeholder =
                "Add something...";


            checkbox.addEventListener(
                "change",
                () => {

                    item.completed =
                        checkbox.checked;

                    saveData();

                    renderLists();
                }
            );


            input.addEventListener(
                "input",
                () => {

                    item.text =
                        input.value;

                    saveData();
                }
            );


            row.appendChild(checkbox);
            row.appendChild(input);

            container.appendChild(row);
        }
    );
}


/* =========================================================
   ADD LIST ITEM
   ========================================================= */

function addListItem(type) {

    if (type === "goals") {

        getMonthlyData(selectedDate)
            .goals
            .push({
                text: "",
                completed: false
            });
    }


    if (type === "todo") {

        getMonthlyData(selectedDate)
            .todo
            .push({
                text: "",
                completed: false
            });
    }


    if (type === "personal") {

        data.personal.push({
            text: "",
            completed: false
        });
    }


    if (type === "career") {

        data.career.push({
            text: "",
            completed: false
        });
    }


    saveData();

    renderLists();


    requestAnimationFrame(() => {

        const map = {
            goals: "mobileGoals",
            todo: "mobileTodo",
            personal: "mobilePersonal",
            career: "mobileCareer"
        };


        const container =
            document.getElementById(
                map[type]
            );


        if (!container) {
            return;
        }


        const inputs =
            container.querySelectorAll(
                ".list-input"
            );


        if (inputs.length) {

            inputs[
                inputs.length - 1
            ].focus();
        }
    });
}


/* =========================================================
   LIST BUTTONS
   ========================================================= */

document
    .querySelectorAll(".add-list")
    .forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                addListItem(
                    button.dataset.list
                );
            }
        );
    });


/* =========================================================
   MONTH NAVIGATION
   ========================================================= */

document
    .getElementById("previousMonth")
    ?.addEventListener(
        "click",
        () => {

            selectedDate =
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth() - 1,
                    1
                );

            renderAll();
        }
    );


document
    .getElementById("nextMonth")
    ?.addEventListener(
        "click",
        () => {

            selectedDate =
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth() + 1,
                    1
                );

            renderAll();
        }
    );


document
    .getElementById("todayButton")
    ?.addEventListener(
        "click",
        () => {

            selectedDate =
                new Date(realToday);

            renderAll();
        }
    );


/* =========================================================
   MOBILE DAY NAVIGATION
   ========================================================= */

document
    .getElementById("previousDay")
    ?.addEventListener(
        "click",
        () => {

            selectedDate.setDate(
                selectedDate.getDate() - 1
            );

            renderAll();
        }
    );


document
    .getElementById("nextDay")
    ?.addEventListener(
        "click",
        () => {

            selectedDate.setDate(
                selectedDate.getDate() + 1
            );

            renderAll();
        }
    );


document
    .getElementById("mobileToday")
    ?.addEventListener(
        "click",
        () => {

            selectedDate =
                new Date(realToday);

            renderAll();
        }
    );


/* =========================================================
   DATE PICKER
   ========================================================= */

const datePicker =
    document.getElementById(
        "datePicker"
    );


document
    .getElementById("chooseDate")
    ?.addEventListener(
        "click",
        () => {

            datePicker.value =
                dateKey(selectedDate);


            if (
                typeof datePicker.showPicker ===
                "function"
            ) {

                datePicker.showPicker();

            } else {

                datePicker.click();
            }
        }
    );


datePicker?.addEventListener(
    "change",
    () => {

        if (!datePicker.value) {
            return;
        }


        const [
            year,
            month,
            day
        ] =
            datePicker.value.split("-");


        selectedDate =
            new Date(
                Number(year),
                Number(month) - 1,
                Number(day)
            );


        renderAll();
    }
);


/* =========================================================
   MOBILE ADD TASK
   ========================================================= */

document
    .getElementById("mobileAddTask")
    ?.addEventListener(
        "click",
        () => {

            const tasks =
                getDailyTasks(
                    selectedDate
                );


            tasks.push({
                text: "",
                completed: false
            });


            saveData();

            renderAll();


            requestAnimationFrame(() => {

                const inputs =
                    document.querySelectorAll(
                        "#mobileTasks input[type='text']"
                    );


                if (inputs.length) {

                    inputs[
                        inputs.length - 1
                    ].focus();
                }
            });
        }
    );


/* =========================================================
   NOTES
   ========================================================= */

const desktopNotes =
    document.getElementById("notes");

const mobileNotes =
    document.getElementById("mobileNotes");


if (desktopNotes) {
    desktopNotes.value =
        data.notes || "";
}

if (mobileNotes) {
    mobileNotes.value =
        data.notes || "";
}


desktopNotes?.addEventListener(
    "input",
    () => {

        data.notes =
            desktopNotes.value;

        if (mobileNotes) {
            mobileNotes.value =
                desktopNotes.value;
        }

        saveData();
    }
);


mobileNotes?.addEventListener(
    "input",
    () => {

        data.notes =
            mobileNotes.value;

        if (desktopNotes) {
            desktopNotes.value =
                mobileNotes.value;
        }

        saveData();
    }
);


/* =========================================================
   DRAWER
   ========================================================= */

const drawer =
    document.getElementById("drawer");

const drawerOverlay =
    document.getElementById(
        "drawerOverlay"
    );


function openDrawer() {

    drawer?.classList.add("open");

    drawerOverlay?.classList.add("open");

    document.body.style.overflow =
        "hidden";
}


function closeDrawer() {

    drawer?.classList.remove("open");

    drawerOverlay?.classList.remove("open");

    document.body.style.overflow =
        "";
}


document
    .getElementById("openDrawer")
    ?.addEventListener(
        "click",
        openDrawer
    );


document
    .getElementById("closeDrawer")
    ?.addEventListener(
        "click",
        closeDrawer
    );


drawerOverlay?.addEventListener(
    "click",
    closeDrawer
);


/* =========================================================
   ESC CLOSE DRAWER
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {
            closeDrawer();
        }
    }
);


/* =========================================================
   SWIPE — MOBILE DAY
   ========================================================= */

let touchStartX = 0;
let touchStartY = 0;


document.addEventListener(
    "touchstart",
    event => {

        touchStartX =
            event.changedTouches[0].screenX;

        touchStartY =
            event.changedTouches[0].screenY;
    },
    {
        passive: true
    }
);


document.addEventListener(
    "touchend",
    event => {

        const touchEndX =
            event.changedTouches[0].screenX;

        const touchEndY =
            event.changedTouches[0].screenY;


        const deltaX =
            touchEndX - touchStartX;

        const deltaY =
            touchEndY - touchStartY;


        /* Only treat horizontal swipes as navigation */

        if (
            Math.abs(deltaX) < 60 ||
            Math.abs(deltaX) < Math.abs(deltaY)
        ) {
            return;
        }


        /* Only enable swipe on mobile */

        if (
            window.innerWidth > 768
        ) {
            return;
        }


        if (deltaX < 0) {

            /* Swipe left → next day */

            selectedDate.setDate(
                selectedDate.getDate() + 1
            );

        } else {

            /* Swipe right → previous day */

            selectedDate.setDate(
                selectedDate.getDate() - 1
            );
        }


        renderAll();
    },
    {
        passive: true
    }
);


/* =========================================================
   KEYBOARD DAY NAVIGATION
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
         * Don't hijack keyboard arrows
         * while user is typing.
         */

        const tag =
            document.activeElement?.tagName;


        if (
            tag === "INPUT" ||
            tag === "TEXTAREA"
        ) {
            return;
        }


        if (event.key === "ArrowLeft") {

            if (
                window.innerWidth <= 768
            ) {

                selectedDate.setDate(
                    selectedDate.getDate() - 1
                );

                renderAll();
            }
        }


        if (event.key === "ArrowRight") {

            if (
                window.innerWidth <= 768
            ) {

                selectedDate.setDate(
                    selectedDate.getDate() + 1
                );

                renderAll();
            }
        }
    }
);


/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {

    const monthName =
        selectedDate.toLocaleDateString(
            "en-US",
            {
                month: "long"
            }
        );

    const year =
        selectedDate.getFullYear();


    const monthElement =
        document.getElementById(
            "monthName"
        );

    const yearElement =
        document.getElementById(
            "yearName"
        );


    if (monthElement) {
        monthElement.textContent =
            monthName;
    }

    if (yearElement) {
        yearElement.textContent =
            year;
    }


    renderDesktopCalendar();

    renderMobileDay();

    renderLists();

    updateDesktopProgress();

    updateMobileProgress();

    saveData();
}


/* =========================================================
   INITIALIZE
   ========================================================= */

renderAll();