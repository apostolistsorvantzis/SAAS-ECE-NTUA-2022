FROM node:16-buster
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
# We are running install again because for some reason node_modules get copied
RUN npm install
CMD npm run prod
EXPOSE 3321