import argparse
import sys
from backend.database import TX, DB
from backend.api.user import make_login



def invite_command(tx: TX, args: argparse.Namespace) -> None:
    fdfid = args.fdfid
    email = args.email
    login_at, link = make_login(tx, fdfid)
    if args.print:
        print(link)
    # if email:
    #     print("Getting the email address from the database is not yet supported")
    #     sys.exit(1)
    # backend.deltagere.api.user.make_invitation(tx, fdfid)

def main() -> None:
    # print(sys.argv)
    parser = argparse.ArgumentParser(
        prog="Klinteborg cli",
        description="Command Line Interface for Klinteborg")
    subparsers = parser.add_subparsers(required=True, dest="command")

    parser_invite = subparsers.add_parser("invite", help="Invite a user")
    parser_invite.set_defaults(command_func=invite_command)
    parser_invite.add_argument("--fdfid", required=False, type=int, help="The fdfid of the user to invite")
    parser_invite.add_argument("--email", type=str, help="The email of the user to invite, if not specified the users email is used")
    parser_invite.add_argument("--print", action="store_true", help="Print the login link")
    args = parser.parse_args()
    with DB() as db:
        with db.transaction() as tx:
            args.command_func(tx, args)
if __name__ == "__main__":
    main()
