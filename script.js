document.addEventListener("DOMContentLoaded", function () {

    const checkboxes =
        document.querySelectorAll(".assignment-checkbox");

    checkboxes.forEach(function (checkbox) {

        checkbox.addEventListener("change", function () {

            const id = this.dataset.id;

            const completed = this.checked;

            fetch(`/update/${id}`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    completed: completed
                })

            })

            .then(response => response.json())

            .then(data => {

                updateAssignmentUI(
                    this,
                    completed
                );

                updateDashboard();

            })

            .catch(error => {

                console.error(error);

                this.checked = !completed;

            });

        });

    });


    updateDashboard();

});


function updateAssignmentUI(
    checkbox,
    completed
) {

    const assignment =
        checkbox.closest(".assignment");

    const status =
        assignment.querySelector(".status");


    if (completed) {

        assignment.classList.add("completed");

        status.textContent =
            "Completed";

    } else {

        assignment.classList.remove("completed");

        status.textContent =
            "Pending";

    }

}


function updateDashboard() {

    const assignments =
        document.querySelectorAll(
            ".assignment"
        );

    const checkboxes =
        document.querySelectorAll(
            ".assignment-checkbox"
        );


    const total =
        assignments.length;


    const completed =
        document.querySelectorAll(
            ".assignment-checkbox:checked"
        ).length;


    const pending =
        total - completed;


    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );

    }


    document.getElementById(
        "totalAssignments"
    ).textContent = total;


    document.getElementById(
        "completedAssignments"
    ).textContent = completed;


    document.getElementById(
        "pendingAssignments"
    ).textContent = pending;


    document.getElementById(
        "percentage"
    ).textContent = percentage + "%";


    updateCircle(percentage);

    updateSubjectProgress();

}


function updateCircle(percentage) {

    const circle =
        document.getElementById(
            "progressCircle"
        );


    const degrees =
        (percentage / 100) * 360;


    circle.style.background =
        `conic-gradient(
            #6366f1 ${degrees}deg,
            #e2e8f0 ${degrees}deg
        )`;

}


function updateSubjectProgress() {

    const subjects =
        document.querySelectorAll(
            ".subject-card"
        );


    subjects.forEach(function (subject) {

        const assignments =
            subject.querySelectorAll(
                ".assignment"
            );


        const completed =
            subject.querySelectorAll(
                ".assignment-checkbox:checked"
            ).length;


        const total =
            assignments.length;


        let percentage = 0;


        if (total > 0) {

            percentage =
                Math.round(
                    (completed / total) * 100
                );

        }


        const percentText =
            subject.querySelector(
                ".subject-percent"
            );


        const progressBar =
            subject.querySelector(
                ".mini-progress-bar"
            );


        percentText.textContent =
            percentage + "%";


        progressBar.style.width =
            percentage + "%";

    });

}


function filterSubject(
    subject,
    button
) {

    const buttons =
        document.querySelectorAll(
            ".filter-btn"
        );


    buttons.forEach(function (btn) {

        btn.classList.remove(
            "active"
        );

    });


    button.classList.add("active");


    const cards =
        document.querySelectorAll(
            ".subject-card"
        );


    cards.forEach(function (card) {

        if (
            subject === "all" ||
            card.dataset.subject === subject
        ) {

            card.style.display =
                "block";

        } else {

            card.style.display =
                "none";

        }

    });

}


function resetAssignments() {

    const confirmed =
        confirm(
            "Are you sure you want to reset all assignments?"
        );


    if (!confirmed) {
        return;
    }


    fetch("/reset", {
        method: "POST"
    })
    .then(() => {
        window.location.reload();
    });

}