echo "\n[i] Aplicando Schema de Prisma"
cd dist && npx prisma db push

echo "\n[i] Iniciando Aplicacion"
cd .. && npm run start:prod