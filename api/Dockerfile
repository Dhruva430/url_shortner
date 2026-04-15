FROM golang:1.25 AS base

WORKDIR /app

COPY go.sum go.mod ./
RUN go mod download

COPY . .

FROM base AS prod-builder
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/api ./main.go

FROM debian:bookworm-slim AS prod
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=prod-builder /out/api /app/api
EXPOSE 8080
CMD ["/app/api"]

FROM base AS dev
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*

# Development tools only
RUN go install github.com/air-verse/air@latest
RUN go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

RUN chmod +x ./scripts/dev-start.sh
RUN sqlc generate -f ./db/sqlc.yaml

EXPOSE 8080
CMD ["sh", "./scripts/dev-start.sh"]
