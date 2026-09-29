from flask import Flask, render_template, request, redirect, jsonify
import sqlite3

app = Flask(__name__)

DATABASE = "assignments.db"

SUBJECTS = [
    "Computer Networking",
    "Occupational Health and Safety Management",
    "System Software",
    "Microprocessor and Interfacing",
    "Python for Data Science",
    "Web Application Development"
]


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            assignment_no INTEGER NOT NULL,
            title TEXT NOT NULL,
            completed INTEGER DEFAULT 0
        )
    """)

    # Check whether assignments already exist
    count = conn.execute(
        "SELECT COUNT(*) FROM assignments"
    ).fetchone()[0]

    if count == 0:
        for subject in SUBJECTS:
            for i in range(1, 6):
                conn.execute(
                    """
                    INSERT INTO assignments
                    (subject, assignment_no, title, completed)
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        subject,
                        i,
                        f"Assignment {i}",
                        0
                    )
                )

    conn.commit()
    conn.close()


@app.route("/")
def index():
    conn = get_db_connection()

    assignments = conn.execute(
        "SELECT * FROM assignments ORDER BY id"
    ).fetchall()

    conn.close()

    return render_template(
        "index.html",
        assignments=assignments,
        subjects=SUBJECTS
    )


@app.route("/update/<int:assignment_id>", methods=["POST"])
def update_assignment(assignment_id):

    data = request.get_json()

    completed = 1 if data.get("completed") else 0

    conn = get_db_connection()

    conn.execute(
        """
        UPDATE assignments
        SET completed = ?
        WHERE id = ?
        """,
        (completed, assignment_id)
    )

    conn.commit()

    # Get updated statistics
    total = conn.execute(
        "SELECT COUNT(*) FROM assignments"
    ).fetchone()[0]

    completed_count = conn.execute(
        "SELECT COUNT(*) FROM assignments WHERE completed = 1"
    ).fetchone()[0]

    conn.close()

    percentage = round(
        (completed_count / total) * 100
    ) if total else 0

    return jsonify({
        "success": True,
        "completed": completed_count,
        "total": total,
        "percentage": percentage
    })


@app.route("/reset", methods=["POST"])
def reset_assignments():

    conn = get_db_connection()

    conn.execute(
        "UPDATE assignments SET completed = 0"
    )

    conn.commit()
    conn.close()

    return redirect("/")


@app.route("/add", methods=["POST"])
def add_assignment():

    subject = request.form.get("subject")
    title = request.form.get("title")

    if subject and title:

        conn = get_db_connection()

        existing = conn.execute(
            """
            SELECT MAX(assignment_no)
            FROM assignments
            WHERE subject = ?
            """,
            (subject,)
        ).fetchone()[0]

        assignment_no = (existing or 0) + 1

        conn.execute(
            """
            INSERT INTO assignments
            (subject, assignment_no, title, completed)
            VALUES (?, ?, ?, 0)
            """,
            (subject, assignment_no, title)
        )

        conn.commit()
        conn.close()

    return redirect("/")


if __name__ == "__main__":
    init_db()

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )