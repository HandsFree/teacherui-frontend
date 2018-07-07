FROM crowdriff/docker-go-postgres

# Installing packages
RUN apt-get update &&\
    apt-get install -y apt-transport-https &&\
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - &&\
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list &&\
    curl -sL https://deb.nodesource.com/setup_10.x | bash - &&\
    apt-get install -y yarn &&\
    apt-get install -y nodejs

# Make go folder
RUN mkdir -p /go/src/github.com/HandsFree/beaconing-teacher-ui

# Copy code to folder
COPY . /go/src/github.com/HandsFree/beaconing-teacher-ui

# Set root dir for commands
WORKDIR /go/src/github.com/HandsFree/beaconing-teacher-ui/backend

# Setup PostgreSQL
USER postgres
RUN service postgresql start &&\
    createdb beaconing &&\
    cd /go/src/github.com/HandsFree/beaconing-teacher-ui/ &&\
    psql beaconing < beaconing.schema.sql

# Build
USER root
RUN go get &&\
    go build -o beaconing &&\
    cd ../frontend &&\
    rm -rf node_modules &&\
    rm yarn.lock &&\
    yarn &&\
    yarn b

ADD docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT [ "/docker-entrypoint.sh" ]

EXPOSE 8080