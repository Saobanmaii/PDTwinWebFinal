@echo off
set JAR=pdtwin-backend-0.0.1-SNAPSHOT.jar

if not exist %JAR% (
    echo ERROR: Khong tim thay %JAR%. Hay copy JAR vao cung thu muc nay.
    pause
    exit /b 1
)

if not exist uploads mkdir uploads

echo Dam bao MySQL 8.0 dang chay tren server nay (port 3306) truoc khi tiep tuc.
echo Starting P-DTwin...
echo Frontend + Backend: http://localhost:8080
echo.
java -jar %JAR% --spring.profiles.active=prod --app.upload.dir=uploads/ --app.unity.dir=unity-builds --server.port=8080
pause
