FROM golang:1.24
WORKDIR /app

# Install Air for live reloading
RUN go install github.com/air-verse/air@latest


COPY go.sum go.mod ./

RUN go mod download

COPY . .

EXPOSE 8080

CMD ["air"]
