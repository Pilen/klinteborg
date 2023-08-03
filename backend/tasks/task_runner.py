
from backend.database import dbpool



def download_task(db: DB):
    downloaded = download()
    with db.transaction() as tx:
        extract(downloaded, tx)
        now = tx.fetch_one("SELECT now() as now")["now"]
    # now = datetime.datetime.now()
    if now.month == 5 or now.month == 6:
        return schedule_hour(now, [8, 10, 12, 14, 16, 18, 20, 22])
    else:
        return schedule_hour(now, [8, 12, 16, 20])


TASKS = {
    "download": download_task,
    # "backup": backup_task,
    # "invite": invite_task,
    }


def schedule_hour(now, hours):
    # now = datetime.datetime.now()
    current_hour = now.hour
    next_hour = current_hour + 1 # We explicitly don't do % 24 here as rolling over has to change the day too.
    for h in hours:
        if h > next_hour:
            scheduled_to = datetime.datetime(now.year, now.month, now.day, h, 0)
    else:
        # Tomorrow at the first posible time
        h = hours[0]
        scheduled_to = datetime.datetime(now.year, now.month, now.day, hours, 0) + datetime.timedelta(days = 1)


def ensure_no_running_tasks(tx: TX):
    running = tx.fetch_all("""
    SELECT task_type, scheduled_to, started_at
      FROM tasks
     WHERE started_at IS NOT NULL
    """)
    if len(running) > 0:
        raise Exception("There are unfinished tasks! The task_runner will not start until that has been cleaned manually.")

def create_initial_tasks(tx: TX):
    rows = tx.fetch_all("""
    SELECT task_type
      FROM tasks
    """)
    existing_tasks = set(row["task_type"] for row in rows)
    defined_tasks = set(TASKS.keys())
    for task in existing_tasks - defined_tasks:
        tx.execute("""
        DELETE FROM tasks
              WHERE task_type = ?
        """, task)
    for task in defined_tasks - existing_tasks:
        tx.insert("tasks",
                  task_type = task,
                  scheduled_to = RawSQL("now()"),
                  started_at = None,
                  )

def next_task():
    with db.transaction() as tx:
        row = tx.fetch_maybe("""
          SELECT task_type
            FROM tasks
           WHERE scheduled_to <= now()
        ORDER BY scheduled_to ASC
           LIMIT 1
        """)
        if row is None:
            return
        started_at = tx.fetch("""
           UPDATE tasks
              SET started_at = now()
            WEHRE task_type = ?
        RETURNING started_at
        """, row["task_type"])["started_at"]
    func = TASKS[row["task_type"]]
    try:
        scheduled_to = func(db)
    except Exception as e:
        with db.transaction() as tx:
            db.insert("task_log",
                      task_type = row["task_type"],
                      scheduled_to = row["scheduled_to"],
                      started_at = started_at,
                      finished_at = RawSQL("now()"),
                      success = False,
                      message = str(e))
        raise
    else:
        with db.transaction() as tx:
            tx.insert("task_log",
                      task_type = row["task_type"],
                      scheduled_to = row["scheduled_to"],
                      started_at = started_at,
                      finished_at = RawSQL("now()"),
                      success = True,
                      message = "")
            tx.execute("""
            UPDATE tasks
               SET scheduled_to = ?,
                   started_at = null
             WHERE task_type = ?
            """, scheduled_to, row["task_type"])










def scan_tasks():
    tx.fetch_maybe()
def schedule_task():
    pass

def main():
    dbpool.open()
    ensure_no_running_tasks()
    create_initial_tasks()
    while True:
        pass


if __name__ == "__main__":
    main()
