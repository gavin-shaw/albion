FROM ubuntu

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y python3 python3-pip mysql-client wget && rm -rf /var/lib/apt/lists/*
RUN pip3 install beautifulsoup4 requests

RUN mkdir /app
RUN mkdir /data

COPY ./download.py /app/download.py

WORKDIR /data

CMD python3 /app/download.py