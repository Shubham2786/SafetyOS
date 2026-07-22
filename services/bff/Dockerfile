# syntax=docker/dockerfile:1
FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY services/bff/go.mod .
COPY services/bff/go.sum .
RUN go mod download
COPY services/bff ./
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /app/bff ./cmd/server/main.go
# Runtime stage
FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/bff .
EXPOSE 8080
CMD ["./bff"]
