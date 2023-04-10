
FROM python:3.11

# RUN \
#     apt-get update &&\
#     apt-get install -y nodejs npm &&\
#     echo ""


WORKDIR /app

COPY deploy/requirements.txt .
RUN python3 -m venv venv && ./venv/bin/python3 -m pip install -r requirements.txt
COPY backend/ backend/
CMD ["bash"]
