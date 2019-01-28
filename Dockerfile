FROM node:alpine
LABEL maintainer="pereira.axel@outlook.fr"

RUN mkdir -p /opt/pereiraax/pods-dependencies
WORKDIR /opt/pereiraax/pods-dependencies

COPY package.json /opt/pereiraax/pods-dependencies/package.json

RUN npm install

COPY ./src /opt/pereiraax/pods-dependencies/src

CMD ["npm", "start"]
