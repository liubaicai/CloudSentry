#Requires -RunAsAdministrator
<#
.SYNOPSIS
    CloudSentry Windows Installation Script

.DESCRIPTION
    This script installs CloudSentry and all its dependencies on Windows:
    - Node.js 20.x
    - PostgreSQL 16
    - Caddy web server
    - CloudSentry application

.NOTES
    Run this script as Administrator
    Usage: powershell -ExecutionPolicy Bypass -File install-windows.ps1

.EXAMPLE
    .\install-windows.ps1
#>

param(
    [string]$InstallDir = "C:\CloudSentry",
    [string]$PostgresUser = "cloudsentry",
    [string]$PostgresPassword = "",
    [string]$PostgresDb = "cloudsentry",
    [string]$JwtSecret = "",
    [int]$BackendPort = 3000,
    [int]$FrontendPort = 80
)

# Generate random secrets if not provided
function New-RandomString {
    param([int]$Length = 32)
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    $result = -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $result
}

# Generate random secrets if not provided
if ([string]::IsNullOrEmpty($PostgresPassword)) {
    $PostgresPassword = New-RandomString -Length 24
}
if ([string]::IsNullOrEmpty($JwtSecret)) {
    $JwtSecret = New-RandomString -Length 64
}

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "[INFO] $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[SUCCESS] $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "[WARNING] $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" "Red"
}

# Check if running as Administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check if a command exists
function Test-Command {
    param([string]$Command)
    return (Get-Command $Command -ErrorAction SilentlyContinue) -ne $null
}

# Download file with progress
function Download-File {
    param([string]$Url, [string]$OutFile)
    Write-Info "Downloading $Url..."
    
    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing
        $ProgressPreference = 'Continue'
    }
    catch {
        Write-Error "Failed to download $Url"
        throw
    }
}

# Install Chocolatey if not present
function Install-Chocolatey {
    if (Test-Command "choco") {
        Write-Success "Chocolatey is already installed"
        return
    }
    
    Write-Info "Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    
    Write-Success "Chocolatey installed"
}

# Install Node.js
function Install-NodeJs {
    if (Test-Command "node") {
        $nodeVersion = (node --version) -replace 'v', ''
        $majorVersion = [int]($nodeVersion.Split('.')[0])
        if ($majorVersion -ge 18) {
            Write-Success "Node.js v$nodeVersion is already installed"
            return
        }
    }
    
    Write-Info "Installing Node.js 20.x..."
    choco install nodejs-lts -y --version=20.18.0
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    
    Write-Success "Node.js installed: $(node --version)"
}

# Install PostgreSQL
function Install-PostgreSQL {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        Write-Success "PostgreSQL is already installed"
        return $true
    }
    
    Write-Info "Installing PostgreSQL 16..."
    choco install postgresql16 -y --params "/Password:$PostgresPassword"
    
    # Wait for service to be ready
    Start-Sleep -Seconds 5
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    
    Write-Success "PostgreSQL installed"
    return $false
}

# Configure PostgreSQL
function Configure-PostgreSQL {
    Write-Info "Configuring PostgreSQL..."
    
    # Find psql executable
    $pgPaths = @(
        "C:\Program Files\PostgreSQL\16\bin",
        "C:\Program Files\PostgreSQL\15\bin",
        "C:\Program Files\PostgreSQL\14\bin"
    )
    
    $psqlPath = $null
    foreach ($path in $pgPaths) {
        if (Test-Path "$path\psql.exe") {
            $psqlPath = $path
            break
        }
    }
    
    if (-not $psqlPath) {
        Write-Warning "PostgreSQL bin directory not found. Please configure manually."
        return
    }
    
    $env:PGPASSWORD = $PostgresPassword
    $psql = "$psqlPath\psql.exe"
    
    # Wait for PostgreSQL to be ready
    Start-Sleep -Seconds 3
    
    # Create user and database
    try {
        # Check if user exists
        $userExists = & $psql -U postgres -h localhost -c "SELECT 1 FROM pg_roles WHERE rolname='$PostgresUser'" 2>&1
        if ($userExists -notmatch "1 row") {
            & $psql -U postgres -h localhost -c "CREATE USER $PostgresUser WITH PASSWORD '$PostgresPassword';" 2>&1
        }
        
        # Check if database exists
        $dbExists = & $psql -U postgres -h localhost -c "SELECT 1 FROM pg_database WHERE datname='$PostgresDb'" 2>&1
        if ($dbExists -notmatch "1 row") {
            & $psql -U postgres -h localhost -c "CREATE DATABASE $PostgresDb OWNER $PostgresUser;" 2>&1
        }
        
        & $psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE $PostgresDb TO $PostgresUser;" 2>&1
    }
    catch {
        Write-Warning "Database configuration may require manual setup: $_"
    }
    
    Write-Success "PostgreSQL configured"
}

# Install Caddy
function Install-Caddy {
    if (Test-Command "caddy") {
        Write-Success "Caddy is already installed"
        return
    }
    
    Write-Info "Installing Caddy..."
    choco install caddy -y
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    
    Write-Success "Caddy installed"
}

# Install CloudSentry
function Install-CloudSentry {
    Write-Info "Installing CloudSentry..."
    
    # Create installation directory
    if (-not (Test-Path $InstallDir)) {
        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    }
    
    # Get script directory
    $scriptDir = Split-Path -Parent $PSCommandPath
    
    # Check if running from repo
    if (-not (Test-Path "$scriptDir\backend") -or -not (Test-Path "$scriptDir\frontend")) {
        Write-Error "Application files not found. Please run this script from the CloudSentry repository directory."
        exit 1
    }
    
    # Copy application files
    Write-Info "Copying application files..."
    Copy-Item -Path "$scriptDir\backend" -Destination $InstallDir -Recurse -Force
    Copy-Item -Path "$scriptDir\frontend" -Destination $InstallDir -Recurse -Force
    if (Test-Path "$scriptDir\package.json") {
        Copy-Item -Path "$scriptDir\package.json" -Destination $InstallDir -Force
    }
    if (Test-Path "$scriptDir\package-lock.json") {
        Copy-Item -Path "$scriptDir\package-lock.json" -Destination $InstallDir -Force
    }
    
    # Install backend dependencies
    Write-Info "Installing backend dependencies..."
    Set-Location "$InstallDir\backend"
    npm install
    
    # Create backend .env file
    $envContent = @"
# Database
DATABASE_URL="postgresql://${PostgresUser}:${PostgresPassword}@localhost:5432/${PostgresDb}?schema=public"

# JWT
JWT_SECRET="${JwtSecret}"
JWT_EXPIRES_IN="7d"

# Server
PORT=${BackendPort}
NODE_ENV="production"

# CORS
CORS_ORIGIN="http://localhost"
"@
    Set-Content -Path "$InstallDir\backend\.env" -Value $envContent
    
    # Generate Prisma client and run migrations
    Write-Info "Setting up database schema..."
    npx prisma generate
    npx prisma db push
    
    # Build backend
    Write-Info "Building backend..."
    npm run build
    
    # Install frontend dependencies
    Write-Info "Installing frontend dependencies..."
    Set-Location "$InstallDir\frontend"
    npm install
    
    # Build frontend
    Write-Info "Building frontend..."
    npm run build
    
    Write-Success "CloudSentry installed"
}

# Configure Caddy
function Configure-Caddy {
    Write-Info "Configuring Caddy..."
    
    # Create Caddy config directory
    $caddyConfigDir = "C:\Caddy"
    if (-not (Test-Path $caddyConfigDir)) {
        New-Item -ItemType Directory -Path $caddyConfigDir -Force | Out-Null
    }
    
    # Create Caddyfile
    $caddyfile = @"
:${FrontendPort} {
    # Set the document root
    root * ${InstallDir}\frontend\dist

    # Enable gzip compression
    encode gzip

    # Add security headers
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    # Proxy API requests to backend
    handle /api/* {
        reverse_proxy localhost:${BackendPort}
    }

    # Handle static files and SPA routing
    handle {
        try_files {path} /index.html
        file_server
    }

    log {
        output file ${caddyConfigDir}\access.log
        format console
    }
}
"@
    Set-Content -Path "$caddyConfigDir\Caddyfile" -Value $caddyfile
    
    Write-Success "Caddy configured"
}

# Create Windows Services using NSSM
function Create-WindowsServices {
    Write-Info "Creating Windows services..."
    
    # Install NSSM
    if (-not (Test-Command "nssm")) {
        Write-Info "Installing NSSM (Non-Sucking Service Manager)..."
        choco install nssm -y
        
        # Refresh environment
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    }
    
    # Find nssm
    $nssm = "nssm"
    if (-not (Test-Command $nssm)) {
        $nssm = "C:\ProgramData\chocolatey\bin\nssm.exe"
    }
    
    # Create CloudSentry Backend service
    $backendService = Get-Service -Name "CloudSentryBackend" -ErrorAction SilentlyContinue
    if ($backendService) {
        Write-Info "Removing existing CloudSentry Backend service..."
        & $nssm stop CloudSentryBackend 2>&1 | Out-Null
        & $nssm remove CloudSentryBackend confirm 2>&1 | Out-Null
    }
    
    Write-Info "Creating CloudSentry Backend service..."
    $nodePath = (Get-Command node).Source
    & $nssm install CloudSentryBackend $nodePath "$InstallDir\backend\dist\index.js"
    & $nssm set CloudSentryBackend AppDirectory "$InstallDir\backend"
    & $nssm set CloudSentryBackend AppEnvironmentExtra "NODE_ENV=production"
    & $nssm set CloudSentryBackend DisplayName "CloudSentry Backend"
    & $nssm set CloudSentryBackend Description "CloudSentry Backend API Service"
    & $nssm set CloudSentryBackend Start SERVICE_AUTO_START
    & $nssm set CloudSentryBackend AppStdout "$InstallDir\backend\logs\stdout.log"
    & $nssm set CloudSentryBackend AppStderr "$InstallDir\backend\logs\stderr.log"
    
    # Create logs directory
    if (-not (Test-Path "$InstallDir\backend\logs")) {
        New-Item -ItemType Directory -Path "$InstallDir\backend\logs" -Force | Out-Null
    }
    
    # Create CloudSentry Caddy service
    $caddyService = Get-Service -Name "CloudSentryCaddy" -ErrorAction SilentlyContinue
    if ($caddyService) {
        Write-Info "Removing existing CloudSentry Caddy service..."
        & $nssm stop CloudSentryCaddy 2>&1 | Out-Null
        & $nssm remove CloudSentryCaddy confirm 2>&1 | Out-Null
    }
    
    Write-Info "Creating CloudSentry Caddy service..."
    $caddyPath = (Get-Command caddy).Source
    & $nssm install CloudSentryCaddy $caddyPath "run --config C:\Caddy\Caddyfile --adapter caddyfile"
    & $nssm set CloudSentryCaddy DisplayName "CloudSentry Caddy"
    & $nssm set CloudSentryCaddy Description "CloudSentry Caddy Web Server"
    & $nssm set CloudSentryCaddy Start SERVICE_AUTO_START
    
    # Start services
    Write-Info "Starting services..."
    Start-Service -Name "CloudSentryBackend"
    Start-Sleep -Seconds 3
    Start-Service -Name "CloudSentryCaddy"
    
    Write-Success "Windows services created and started"
}

# Configure Windows Firewall
function Configure-Firewall {
    Write-Info "Configuring Windows Firewall..."
    
    # Remove existing rules
    Remove-NetFirewallRule -DisplayName "CloudSentry*" -ErrorAction SilentlyContinue
    
    # Add firewall rules
    New-NetFirewallRule -DisplayName "CloudSentry HTTP" -Direction Inbound -Protocol TCP -LocalPort $FrontendPort -Action Allow | Out-Null
    New-NetFirewallRule -DisplayName "CloudSentry API" -Direction Inbound -Protocol TCP -LocalPort $BackendPort -Action Allow | Out-Null
    New-NetFirewallRule -DisplayName "CloudSentry Syslog TCP" -Direction Inbound -Protocol TCP -LocalPort 514 -Action Allow | Out-Null
    New-NetFirewallRule -DisplayName "CloudSentry Syslog UDP" -Direction Inbound -Protocol UDP -LocalPort 514 -Action Allow | Out-Null
    
    Write-Success "Firewall configured"
}

# Print final instructions
function Show-Instructions {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "  CloudSentry Installation Complete!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access the application:"
    Write-Host "  - Web Interface: http://localhost"
    Write-Host "  - API: http://localhost/api"
    Write-Host "  - Syslog TCP/UDP: localhost:514"
    Write-Host ""
    Write-Host "Service management (Run as Administrator):"
    Write-Host "  - Backend: net {start|stop} CloudSentryBackend"
    Write-Host "  - Caddy: net {start|stop} CloudSentryCaddy"
    Write-Host "  - PostgreSQL: net {start|stop} postgresql-x64-16"
    Write-Host ""
    Write-Host "Configuration files:"
    Write-Host "  - Backend: $InstallDir\backend\.env"
    Write-Host "  - Caddy: C:\Caddy\Caddyfile"
    Write-Host ""
    Write-Host "Logs:"
    Write-Host "  - Backend: $InstallDir\backend\logs\"
    Write-Host "  - Caddy: C:\Caddy\access.log"
    Write-Host ""
    Write-ColorOutput "IMPORTANT: Please change the JWT_SECRET in $InstallDir\backend\.env" "Yellow"
    Write-Host ""
    Write-Host "To seed the database with sample data:"
    Write-Host "  cd $InstallDir\backend"
    Write-Host "  npx tsx prisma/seed.ts"
    Write-Host ""
}

# Main installation function
function Main {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "  CloudSentry Windows Installer" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check if running as Administrator
    if (-not (Test-Administrator)) {
        Write-Error "This script must be run as Administrator"
        Write-Host "Right-click PowerShell and select 'Run as Administrator'"
        exit 1
    }
    
    # Install dependencies
    Install-Chocolatey
    Install-NodeJs
    $freshPostgres = Install-PostgreSQL
    Install-Caddy
    
    # Configure PostgreSQL (skip if fresh install, let installer set it up)
    if (-not $freshPostgres) {
        Configure-PostgreSQL
    }
    else {
        Start-Sleep -Seconds 10
        Configure-PostgreSQL
    }
    
    # Install CloudSentry
    Install-CloudSentry
    
    # Configure services
    Configure-Caddy
    Create-WindowsServices
    Configure-Firewall
    
    # Show instructions
    Show-Instructions
}

# Run main function
Main
