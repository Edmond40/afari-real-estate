# Test MySQL Connection Script

# MySQL Configuration
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$mysqlUser = "afari_app"
$mysqlPass = "Edmond0209732250"
$mysqlDb = "afari_real_estate_v2"

# Function to execute MySQL query
function Invoke-MySQLQuery {
    param (
        [string]$query
    )
    
    $outputFile = "$env:TEMP\mysql_output.txt"
    $errorFile = "$env:TEMP\mysql_error.txt"
    
    # Build the command
    $arguments = "-u$mysqlUser -p$mysqlPass -e `"$query`" --silent --skip-column-names"
    
    # Execute the command
    $process = Start-Process -FilePath $mysqlPath -ArgumentList $arguments -NoNewWindow -Wait -PassThru -RedirectStandardOutput $outputFile -RedirectStandardError $errorFile
    
    # Check for errors
    $errorContent = Get-Content $errorFile -ErrorAction SilentlyContinue
    if ($errorContent) {
        Write-Host "Error executing query:" -ForegroundColor Red
        $errorContent | ForEach-Object { Write-Host $_ -ForegroundColor Red }
        return $null
    }
    
    # Return the output
    return Get-Content $outputFile -ErrorAction SilentlyContinue
}

# Main script
Write-Host "Testing MySQL Connection..." -ForegroundColor Cyan

# 1. Check if MySQL executable exists
if (-not (Test-Path $mysqlPath)) {
    Write-Host "MySQL client not found at: $mysqlPath" -ForegroundColor Red
    exit 1
}

Write-Host "MySQL client found at: $mysqlPath" -ForegroundColor Green

# 2. Test basic connection
Write-Host "`nTesting basic connection..." -ForegroundColor Cyan
$result = Invoke-MySQLQuery -query "SELECT VERSION() AS version;"

if ($result) {
    Write-Host "Successfully connected to MySQL!" -ForegroundColor Green
    Write-Host "MySQL Version: $result" -ForegroundColor Green
    
    # 3. List all databases
    Write-Host "`nListing all databases:" -ForegroundColor Cyan
    $databases = Invoke-MySQLQuery -query "SHOW DATABASES;"
    $databases | ForEach-Object { Write-Host "- $_" }
    
    # 4. Check if our database exists
    $dbExists = $databases -contains $mysqlDb
    Write-Host "`nDatabase '$mysqlDb' exists: $($dbExists -eq $true ? 'Yes' : 'No')" -ForegroundColor $(if ($dbExists) { 'Green' } else { 'Yellow' })
    
    if ($dbExists) {
        # 5. List tables in our database
        Write-Host "`nListing tables in '$mysqlDb':" -ForegroundColor Cyan
        $tables = Invoke-MySQLQuery -query "USE $mysqlDb; SHOW TABLES;"
        
        if ($tables) {
            $tables | ForEach-Object { Write-Host "- $_" }
            
            # 6. Count rows in each table
            Write-Host "`nRow counts:" -ForegroundColor Cyan
            foreach ($table in $tables) {
                $count = Invoke-MySQLQuery -query "USE $mysqlDb; SELECT COUNT(*) AS count FROM $table;"
                Write-Host "- $table`: $count rows"
            }
        } else {
            Write-Host "No tables found in database '$mysqlDb'" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`nTo create the database, run these commands:" -ForegroundColor Yellow
        Write-Host "1. & '$mysqlPath' -u root -p"
        Write-Host "2. Enter your MySQL root password when prompted"
        Write-Host "3. Run: CREATE DATABASE $mysqlDb;"
        Write-Host "4. Run: GRANT ALL PRIVILEGES ON $mysqlDb.* TO '$mysqlUser'@'localhost' IDENTIFIED BY '$mysqlPass';"
        Write-Host "5. Run: FLUSH PRIVILEGES;"
    }
    
} else {
    Write-Host "Failed to connect to MySQL. Please check your credentials and ensure MySQL is running." -ForegroundColor Red
    
    # Check if MySQL service is running
    $mysqlService = Get-Service -Name MySQL80 -ErrorAction SilentlyContinue
    if ($mysqlService) {
        Write-Host "`nMySQL Service Status: $($mysqlService.Status)" -ForegroundColor $(if ($mysqlService.Status -eq 'Running') { 'Green' } else { 'Red' })
        if ($mysqlService.Status -ne 'Running') {
            Write-Host "To start MySQL service, run: Start-Service MySQL80" -ForegroundColor Yellow
        }
    } else {
        Write-Host "MySQL service not found. Is MySQL installed correctly?" -ForegroundColor Red
    }
    
    # Check if port 3306 is listening
    $portCheck = Test-NetConnection -ComputerName localhost -Port 3306 -InformationLevel Quiet
    Write-Host "`nPort 3306 (MySQL) is $($portCheck ? 'open' : 'closed or blocked')" -ForegroundColor $(if ($portCheck) { 'Green' } else { 'Red' })
}
