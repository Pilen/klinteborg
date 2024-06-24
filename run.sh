#! /bin/bash
set -euo pipefail


DIRECTORY="$(dirname $0)"
cd "$DIRECTORY";


################################################################################
## Parse args
################################################################################
RUN_IN_DOCKER=""
ENV=()
ARGS=()
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            shift
            ENV+=("$1")
            shift
            ;;
        -*|--*)
            echo "ERROR: Unknown option $1"
            exit 1
            ;;
        *)
            ARGS+=("$1")
            shift
            while [[ $# -gt 0 ]]; do
                ARGS+=("$1")
                shift
            done
            ;;
    esac
done

if [[ "${#ARGS[@]}" == 0 ]]; then
    echo "ERROR: No command given"
    exit 1
fi


COMMAND="${ARGS[0]}"
ARGS=("${ARGS[@]:1}")



################################################################################
## Run in docker container
## and call this script recursively
################################################################################

if [ -f /.dockerenv ]; then
    RUN_IN_DOCKER=""
else
    RUN_IN_DOCKER="yes"
fi

DOCKER_FLAGS=()
function ENTER_DOCKER() {
    IMAGE="$1"
    shift;
    ENV_LIST=()
    for env in ${ENV[@]}; do
        ENV_LIST+=("--env")
        ENV_LIST+=("$env")
    done
    if [ -n "$RUN_IN_DOCKER" ]; then
        docker run --rm -it --net="host" --volume="$PWD:/app" --env TERM -w /app -u "$(id --user):$(id --group)" "${DOCKER_FLAGS[@]}" "$IMAGE" bash ./run.sh "${ENV_LIST[@]}" "$COMMAND" "${ARGS[@]}"
        exit;
    else
        export PATH="$HOME/.local/bin:$HOME/remoteconfig/scripts:$PATH"
    fi
}



################################################################################
## Source environment files
################################################################################

# set -a makes all variable definitions be exported by default
# Remember to put ./ in source, else it will try to source command if it is found in $PATH

for env in ${ENV[@]}; do
    if [ -f "$env" ]; then
        set -a
        source "$(realpath $env)"
        set +a
    else
        echo "env file not found: $env"
        exit 1
    fi
done



################################################################################
## Execute command
################################################################################

case $COMMAND in
    dev)
        ENTER_DOCKER klinteborg
        bash
        ;;
    dev-node)
        ENTER_DOCKER node
        bash
        ;;

    cli)
        DOCKER_FLAGS=(--volume "${DATA_MOUNT}:${DATA_DIR}")
        ENTER_DOCKER klinteborg
        ./venv/bin/python3 -m backend.tasks.cli "${ARGS[@]}"
        ;;

    backend)
        DOCKER_FLAGS=(--volume "${DATA_MOUNT}:${DATA_DIR}")
        ENTER_DOCKER klinteborg
        ./venv/bin/uvicorn "backend.main:app"
        ;;
    backend-watch)
        DOCKER_FLAGS=(--volume "${DATA_MOUNT}:${DATA_DIR}")
        ENTER_DOCKER klinteborg
        ./venv/bin/uvicorn "backend.main:app" --reload --host 0.0.0.0
        ;;

    frontend)
        ENTER_DOCKER node
        cd frontend
        ./node_modules/esbuild/bin/esbuild --bundle --minify --outfile=static/bin/app.js src/index.ts
        ;;
    frontend-watch)
        ENTER_DOCKER node
        cd frontend
        ./node_modules/esbuild/bin/esbuild --tsconfig=../deploy/tsconfig.json --bundle --sourcemap --outfile=static/bin/app.js --watch src/index.ts
        ;;
    frontend-typecheck | frontend-typescript)
        ENTER_DOCKER node
        ./frontend/node_modules/typescript/bin/tsc --noEmit --esModuleInterop --target es2021 frontend/src/index.ts
        ;;
    frontend-typecheck-watch | frontend-typescript-watch)
        ENTER_DOCKER node
        # cd frontend
        ./frontend/node_modules/typescript/bin/tsc --noEmit --esModuleInterop --target es2021 --watch frontend/src/index.ts
        # ./frontend/node_modules/typescript/bin/tsc --help
        ;;


    deploy)
        mkdir -p ${POSTGRES_MOUNT}
        docker stack deploy --compose-file deploy/compose.yml klinteborg
        ;;
    stop)
        docker stack rm klinteborg
        ;;
    psql)
        echo docker run --rm -it --net host -e PGPASSWORD=${POSTGRES_PASSWORD} -e PSQL_HISTORY="/runtime/psql_history" -e HISTSIZE="-1" --volume "${HISTORY_MOUNT}:/runtime" postgres:15.0 psql --host ${POSTGRES_HOST} --port ${POSTGRES_PORT} --username ${POSTGRES_USER} --dbname ${POSTGRES_DATABASE}
        ;;

    reset-database)
        set -x
        # https://stackoverflow.com/questions/17449420/postgresql-unable-to-drop-database-because-of-some-auto-connections-to-db
        docker run --rm -it --net host -e PGPASSWORD=${POSTGRES_PASSWORD} postgres:15.0 psql --host ${POSTGRES_HOST} --port ${POSTGRES_PORT} --username ${POSTGRES_USER} -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${POSTGRES_DATABASE}' AND pid <> pg_backend_pid();"
        docker run --rm -it --net host -e PGPASSWORD=${POSTGRES_PASSWORD} postgres:15.0 psql --host ${POSTGRES_HOST} --port ${POSTGRES_PORT} --username ${POSTGRES_USER} -c "DROP DATABASE IF EXISTS ${POSTGRES_DATABASE}"

        docker run --rm -it --net host -e PGPASSWORD=${POSTGRES_PASSWORD} postgres:15.0 psql --host ${POSTGRES_HOST} --port ${POSTGRES_PORT} --username ${POSTGRES_USER} -c "CREATE DATABASE ${POSTGRES_DATABASE}"
        docker run --rm -it --net host -e PGPASSWORD=${POSTGRES_PASSWORD} --volume "${PWD}:/mount" postgres:15.0 psql --host ${POSTGRES_HOST} --port ${POSTGRES_PORT} --username ${POSTGRES_USER} --dbname ${POSTGRES_DATABASE} --file /mount/schema.sql

        curl localhost:8000/api/database/pool/check
        ;;
    setup-database)
        DOCKER_FLAGS=(--volume "${DATA_MOUNT}:${DATA_DIR}")
        ENTER_DOCKER klinteborg
        ./venv/bin/python3 -m backend.tasks.cli import-deltagere

        ./venv/bin/python3 -m backend.tasks.cli load-json --file runtime/data/settings.json
        ./venv/bin/python3 -m backend.tasks.cli load-json --file runtime/data/permissions.json
        ./venv/bin/python3 -m backend.tasks.cli load-json --file runtime/data/grupper.json
        ./venv/bin/python3 -m backend.tasks.cli load-json --file runtime/data/gruppe_medlemmer.json
        ./venv/bin/python3 -m backend.tasks.cli load-json --file runtime/data/default.json
        # ./venv/bin/python3 -m backend.tasks.cli load-json --file runtime/data/livgrupper.json

        ./venv/bin/python3 -m backend.tasks.cli load-arbejdsbyrde-besvarelser --file runtime/data/livgrupper.csv

        # event.registration.xls
        # stamdata.xls

        ;;

    build)
        docker build --file deploy/Dockerfile --tag klinteborg .
        ;;

    mypy)
        ENTER_DOCKER klinteborg
        ./venv/bin/mypy --disallow-untyped-defs --pretty backend tests
        ;;

    pytest)
        ENTER_DOCKER klinteborg
        time ./venv/bin/pytest -sx --ff -vv --color=yes --cov=backend --cov-branch tests | grep -P "^tests/.*/?test_.*\\.py::[^ ]+ \\033\\[32mPASSED" -v
        ./venv/bin/coverage html --precision 2 "--directory=.htmlcoverage"
        ;;

    setup-dev)
        ENTER_DOCKER klinteborg
        python3 -m venv venv
        ./venv/bin/python3 -m pip install -r deploy/requirements.txt
        ;;
    setup-node)
        ENTER_DOCKER node
        cd frontend
        npm init --yes
        npm install mithril
        npm install --save-dev esbuild
        npm install --save-dev typescript
        npm install --save-dev @types/mithril
        npm install apexchart
        ;;
    "")
        echo "ERROR: No command given";
        exit 1;
        ;;
    *)
        echo "ERROR: Unknown command: $COMMAND";
        exit 1;
        ;;

esac
