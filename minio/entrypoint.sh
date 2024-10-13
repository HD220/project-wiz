#!/bin/sh
minio server /data --console-address ":9001" &

# Aguarda até o MinIO estar pronto
echo "Aguardando MinIO iniciar..."
for i in $(seq 1 30); do
  if mc alias set myminio http://localhost:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null 2>&1; then
    echo "MinIO iniciado com sucesso!"
    break
  fi
  echo "MinIO ainda não está pronto, aguardando 1 segundo..."
  sleep 1
done

# Cria os buckets necessários
mc mb myminio/loki-bucket
mc mb myminio/loki-ruler
mc mb myminio/loki-archive
echo "Buckets criados com sucesso!"

wait