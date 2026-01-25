echo "\n[i] Generando cliente de base de datos..."
npx prisma generate

echo "\n[i] Aplicando modelo a la base de datos..."
npx prisma db push

echo "\n[i] Actualizando cliente de base de datos..."
npx prisma generate

echo "\n[i] Iniciando el servidor..."
node ./dist/scr/main.js