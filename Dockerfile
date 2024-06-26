FROM node:21-alpine3.19
RUN mkdir /home/hisv
WORKDIR /home/hisv
COPY yarn.lock package.json ./
RUN yarn install
COPY . /home/hisv/ 
EXPOSE 3000
RUN yarn build
CMD ["yarn", "start", "--host", "0.0.0.0"]
