FROM golang:1.27.3-alpine3.24 AS builder
ENV CGO_ENABLED=0
RUN go install github.com/minio/minio@RELEASE.2025-10-15T17-29-55Z

FROM alpine:3.24.1
RUN apk add --no-cache ca-certificates && mkdir /data && chown 10001:10001 /data
COPY --from=builder /go/bin/minio /usr/local/bin/minio
USER 10001:10001
EXPOSE 9000
ENTRYPOINT ["minio"]
