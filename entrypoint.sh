echo -e "\n[i] Generando cliente de base de datos...\n"
npx prisma generate

echo -e "\n[i] Aplicando modelo a la base de datos...\n"
npx prisma db push

echo -e "\n[i] Actualizando cliente de base de datos...\n"
npx prisma generate

echo -e "\n[i] Iniciando el servidor...\n"
node ./scr/main.js 