import argparse
import json
import sys
from pathlib import Path
from backend.database import TX, DB, Json, Jsonb
# from backend.api.user import make_login
from backend.tasks import load_arbejdsbyrde_besvarelser
import backend.deltagere
from backend.config import config


class Subparser(Interface):
    def add_argument(self, *args: Any, **kwargs: Any) -> None:
        ...

COMMANDS = []
class Command:
    command: str
    help: str
    def args(self, subparser: Subparser) -> None:
        pass
    def run(tx: TX, args: argparse.Namespace) -> None:
        pass
    def __init_subclass__(self, cls) -> None:
        COMMANDS.append(cls)

class Invite(Command):
    command = "invite"
    help = "Invite a user"
    def args(self, subparser: Subparser) -> None:
        # subparser = subparsers.add_parser("invite", help="Invite a user")
        # subparser.set_defaults(command_func=command_invite)
        subparser.add_argument("--fdfid", required=False, type=int, help="The fdfid of the user to invite")
        subparser.add_argument("--email", type=str, help="The email of the user to invite, if not specified the users email is used")
        subparser.add_argument("--print", action="store_true", help="Print the login link")

    def run(tx: TX, args: argparse.Namespace) -> None:
        fdfid = args.fdfid
        email = args.email
        login_at, link = make_login(tx, fdfid)
        if args.print:
            print(link)
        # if email:
        #     print("Getting the email address from the database is not yet supported")
        #     sys.exit(1)
        # backend.deltagere.api.user.make_invitation(tx, fdfid)


class LoadJson(Command):
    command = "load-json"
    help = "Load json into the database"
    def args(self, subparser: Subparser) -> None:
        subparser.add_argument("--file", required=True, type=Path, help="Path to the json file")
    def run(tx: TX, args: argparse.Namespace) -> None:
        path = args.file
        data = json.loads(path.read_text())
        for table, rows in data.items():
            print(f"Inserting into {table}")
            for row in rows:
                for k, v in row.items():
                    if isinstance(v, dict):
                        row[k] = Json(v["$json"])
                tx.insert_row(table, row)


class ImportDeltagere(Command):
    command = "import-deltagere"
    help = "Import all the deltager data from excel file"
    def args(self, subparser: Subparser) -> None:
        # subparser.add_argument("--file", required=True, type=Path, help="Path to the json file")
    def run(tx: TX, args: argparse.Namespace) -> None:
        print(config.data_dir)
        backend.deltagere.import_excel(tx)


class LoadArbejdsbyrdeBesvarelser(Command):
    command = "load-arbejdsbyrde-besvarelser"
    help = "Load arbejdsbyrde besvarelser from csv file"
    def args(self, subparser: Subparser) -> None:
        subparser.add_argument("--file", required=True, type=Path, help="Path to the csv file")
    def run(tx: TX, args: argparse.Namespace) -> None:
        posts, weighting = load_arbejdsbyrde_besvarelser.load(args.file)
        print(len(posts))
        print(len(weighting))
        result = load_arbejdsbyrde_besvarelser.transform(posts, weighting)
        for item in result:
            tx.insert("arbejdsbyrde_besvarelser",
                      grupper = Json(item["grupper"]),
                      vægtning = item["vægtning"])


class SaveJson(Command):
    command = "save-json"
    help = "Export some data to json"
    def args(self, subparser: Subparser) -> None:
        subparser.add_argument("--table", required=True, action="append")
        subparser.add_argument("--output", required=True, type=Path, help="Path to the output file")
    def run(tx: TX, args: argparse.Namespace) -> None:
        result = {}
        for table in args.table:
            assert table.isidentifier()
            rows = tx.fetch_all(f"SELECT * from {table}")
            result[table] = rows
        with args.output.open("w") as file:
            json.dump(result, file, indent=4, ensure_ascii=False)



def main() -> None:
    # print(sys.argv)
    parser = argparse.ArgumentParser(
        prog="Klinteborg cli",
        description="Command Line Interface for Klinteborg")
    subparsers = parser.add_subparsers(required=True, dest="command")

    for command in COMMANDS:
        subparser = subparsers.add_parser(command.command, help=command.help)
        subparser.set_defaults(command=command)

    args = parser.parse_args()
    with DB() as db:
        with db.transaction() as tx:
            command = args.command()
            command.run(tx, args)

    args = parser.parse_args()
    with DB() as db:
        with db.transaction() as tx:
            args.command_func(tx, args)
if __name__ == "__main__":
    main()
