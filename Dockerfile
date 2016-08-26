FROM node:4

RUN apt-get update -qq && \
    apt-get install -y nginx
EXPOSE 80

ADD . /app
WORKDIR /app
RUN make install && \
    npm rebuild node-sass && \
    make build && \
    cp *.html /var/www/html && \
    cp -Rv css /var/www/html/ && \
    cp -Rv build/ /var/www/html/ && \
    cp -Rv partials/ /var/www/html && \
    rm -rf build

ENV CACAO_BACKEND_URL http://localhost:8000

CMD ["/app/.entrypoint.sh"]
