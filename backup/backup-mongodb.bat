@echo off

echo ============================
echo MongoDB Backup Starting...
echo ============================

docker exec 3618e9b69547 mongodump --archive=/data/db/backup.archive

docker cp 3618e9b69547:/data/db/backup.archive ./backup/backup.archive

echo ============================
echo Backup Completed
echo File: backup/backup.archive
echo ============================

pause