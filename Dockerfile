FROM node:21-alpine3.19
RUN mkdir /home/hisv
WORKDIR /home/hisv
COPY yarn.lock package.json ./
RUN yarn install
COPY . /home/hisv/ 
EXPOSE 5173
CMD ["yarn", "dev", "--host", "0.0.0.0"]
