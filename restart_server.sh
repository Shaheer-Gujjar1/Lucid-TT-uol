
lsof -t -i :3001 | xargs -r kill -9 && npm run dev
