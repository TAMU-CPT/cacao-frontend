FROM node:4

ADD . /app
WORKDIR /app
RUN npm install -g yarn && \
	make node_modules && \
	npm rebuild node-sass && \
	make build && \
	mkdir /output/ && \
	cp *.html /output/ && \
	cp -Rv css /output/ && \
	cp -Rv build/ /output/ && \
	cp -Rv partials/ /output/ && \
	rm -rf build

ENV CACAO_BACKEND_URL http://localhost:8000

CMD ["/app/.entrypoint.sh"]
