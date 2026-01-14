#!/bin/bash
#
# CloudSentry Linux Installation Script
# Supports: Ubuntu/Debian, CentOS/RHEL/Fedora, Arch Linux
#
# Usage: sudo bash install-linux.sh
#
# This script will:
# 1. Detect your Linux distribution
# 2. Install Node.js 20.x
# 3. Install PostgreSQL
# 4. Install Caddy web server
# 5. Configure the database
# 6. Install CloudSentry dependencies
# 7. Set up systemd services
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLOUDSENTRY_USER="cloudsentry"
CLOUDSENTRY_DIR="/opt/cloudsentry"
POSTGRES_USER="cloudsentry"
POSTGRES_PASSWORD="cloudsentry"
POSTGRES_DB="cloudsentry"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
BACKEND_PORT=3000

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script as root or with sudo"
        exit 1
    fi
}

# Detect Linux distribution
detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
        DISTRO_FAMILY=$ID_LIKE
        VERSION=$VERSION_ID
    elif [ -f /etc/redhat-release ]; then
        DISTRO="rhel"
        DISTRO_FAMILY="rhel"
    elif [ -f /etc/debian_version ]; then
        DISTRO="debian"
        DISTRO_FAMILY="debian"
    else
        print_error "Unable to detect Linux distribution"
        exit 1
    fi
    
    print_info "Detected distribution: $DISTRO (family: $DISTRO_FAMILY)"
}

# Install packages for Debian/Ubuntu
install_debian() {
    print_info "Installing packages for Debian/Ubuntu..."
    
    # Update package list
    apt-get update
    
    # Install essential packages
    apt-get install -y curl gnupg lsb-release ca-certificates git
    
    # Install Node.js 20.x
    if ! command -v node &> /dev/null; then
        print_info "Installing Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    else
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            print_info "Upgrading Node.js to 20.x..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
        else
            print_success "Node.js $(node --version) is already installed"
        fi
    fi
    
    # Install PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_info "Installing PostgreSQL..."
        apt-get install -y postgresql postgresql-contrib
    else
        print_success "PostgreSQL is already installed"
    fi
    
    # Install Caddy
    if ! command -v caddy &> /dev/null; then
        print_info "Installing Caddy..."
        apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
        apt-get update
        apt-get install -y caddy
    else
        print_success "Caddy is already installed"
    fi
}

# Install packages for RHEL/CentOS/Fedora
install_rhel() {
    print_info "Installing packages for RHEL/CentOS/Fedora..."
    
    # Detect package manager
    if command -v dnf &> /dev/null; then
        PKG_MGR="dnf"
    else
        PKG_MGR="yum"
    fi
    
    # Install essential packages
    $PKG_MGR install -y curl git
    
    # Install Node.js 20.x
    if ! command -v node &> /dev/null; then
        print_info "Installing Node.js 20.x..."
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        $PKG_MGR install -y nodejs
    else
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            print_info "Upgrading Node.js to 20.x..."
            curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
            $PKG_MGR install -y nodejs
        else
            print_success "Node.js $(node --version) is already installed"
        fi
    fi
    
    # Install PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_info "Installing PostgreSQL..."
        $PKG_MGR install -y postgresql-server postgresql-contrib
        postgresql-setup --initdb || true
        systemctl enable postgresql
        systemctl start postgresql
    else
        print_success "PostgreSQL is already installed"
    fi
    
    # Install Caddy
    if ! command -v caddy &> /dev/null; then
        print_info "Installing Caddy..."
        $PKG_MGR install -y 'dnf-command(copr)' || true
        $PKG_MGR copr enable -y @caddy/caddy || true
        $PKG_MGR install -y caddy
    else
        print_success "Caddy is already installed"
    fi
}

# Install packages for Arch Linux
install_arch() {
    print_info "Installing packages for Arch Linux..."
    
    # Update package database
    pacman -Sy
    
    # Install essential packages
    pacman -S --noconfirm curl git base-devel
    
    # Install Node.js
    if ! command -v node &> /dev/null; then
        print_info "Installing Node.js..."
        pacman -S --noconfirm nodejs npm
    else
        print_success "Node.js $(node --version) is already installed"
    fi
    
    # Install PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_info "Installing PostgreSQL..."
        pacman -S --noconfirm postgresql
        su - postgres -c "initdb -D /var/lib/postgres/data" || true
        systemctl enable postgresql
        systemctl start postgresql
    else
        print_success "PostgreSQL is already installed"
    fi
    
    # Install Caddy
    if ! command -v caddy &> /dev/null; then
        print_info "Installing Caddy..."
        pacman -S --noconfirm caddy
    else
        print_success "Caddy is already installed"
    fi
}

# Start and configure PostgreSQL
configure_postgresql() {
    print_info "Configuring PostgreSQL..."
    
    # Ensure PostgreSQL is running
    systemctl start postgresql || service postgresql start || true
    systemctl enable postgresql || true
    
    # Wait for PostgreSQL to be ready
    sleep 2
    
    # Create user and database
    su - postgres -c "psql -c \"SELECT 1 FROM pg_roles WHERE rolname='${POSTGRES_USER}'\" | grep -q 1 || psql -c \"CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';\"" || true
    su - postgres -c "psql -c \"SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'\" | grep -q 1 || psql -c \"CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};\"" || true
    su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};\"" || true
    
    print_success "PostgreSQL configured"
}

# Install CloudSentry
install_cloudsentry() {
    print_info "Installing CloudSentry..."
    
    # Create installation directory
    mkdir -p "$CLOUDSENTRY_DIR"
    
    # Get the script directory (where the repo is)
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Copy application files
    if [ -d "$SCRIPT_DIR/backend" ] && [ -d "$SCRIPT_DIR/frontend" ]; then
        print_info "Copying application files from $SCRIPT_DIR..."
        cp -r "$SCRIPT_DIR/backend" "$CLOUDSENTRY_DIR/"
        cp -r "$SCRIPT_DIR/frontend" "$CLOUDSENTRY_DIR/"
        cp "$SCRIPT_DIR/package.json" "$CLOUDSENTRY_DIR/" 2>/dev/null || true
        cp "$SCRIPT_DIR/package-lock.json" "$CLOUDSENTRY_DIR/" 2>/dev/null || true
    else
        print_error "Application files not found. Please run this script from the CloudSentry repository directory."
        exit 1
    fi
    
    # Install backend dependencies
    print_info "Installing backend dependencies..."
    cd "$CLOUDSENTRY_DIR/backend"
    npm install
    
    # Create backend .env file
    cat > "$CLOUDSENTRY_DIR/backend/.env" <<EOF
# Database
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"

# JWT
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="7d"

# Server
PORT=${BACKEND_PORT}
NODE_ENV="production"

# CORS
CORS_ORIGIN="http://localhost"
EOF
    
    # Generate Prisma client and run migrations
    print_info "Setting up database schema..."
    npx prisma generate
    npx prisma db push
    
    # Build backend
    print_info "Building backend..."
    npm run build
    
    # Install frontend dependencies
    print_info "Installing frontend dependencies..."
    cd "$CLOUDSENTRY_DIR/frontend"
    npm install
    
    # Build frontend
    print_info "Building frontend..."
    npm run build
    
    print_success "CloudSentry installed"
}

# Configure Caddy
configure_caddy() {
    print_info "Configuring Caddy..."
    
    # Create Caddyfile
    cat > /etc/caddy/Caddyfile <<EOF
:80 {
    # Set the document root
    root * ${CLOUDSENTRY_DIR}/frontend/dist

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
        reverse_proxy localhost:${BACKEND_PORT}
    }

    # Handle static files and SPA routing
    handle {
        try_files {path} /index.html
        file_server
    }

    log {
        output file /var/log/caddy/access.log
        format console
    }
}
EOF
    
    # Create log directory
    mkdir -p /var/log/caddy
    
    # Enable and restart Caddy
    systemctl enable caddy
    systemctl restart caddy
    
    print_success "Caddy configured"
}

# Create systemd service for backend
create_backend_service() {
    print_info "Creating backend systemd service..."
    
    cat > /etc/systemd/system/cloudsentry-backend.service <<EOF
[Unit]
Description=CloudSentry Backend API
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=${CLOUDSENTRY_DIR}/backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=${CLOUDSENTRY_DIR}/backend/.env

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable cloudsentry-backend
    systemctl start cloudsentry-backend
    
    print_success "Backend service created and started"
}

# Print final instructions
print_instructions() {
    echo ""
    echo "========================================="
    echo -e "${GREEN}  CloudSentry Installation Complete!${NC}"
    echo "========================================="
    echo ""
    echo "Access the application:"
    echo "  - Web Interface: http://localhost"
    echo "  - API: http://localhost/api"
    echo "  - Syslog TCP/UDP: localhost:514"
    echo ""
    echo "Service management:"
    echo "  - Backend: systemctl {start|stop|restart|status} cloudsentry-backend"
    echo "  - Caddy: systemctl {start|stop|restart|status} caddy"
    echo "  - PostgreSQL: systemctl {start|stop|restart|status} postgresql"
    echo ""
    echo "Configuration files:"
    echo "  - Backend: ${CLOUDSENTRY_DIR}/backend/.env"
    echo "  - Caddy: /etc/caddy/Caddyfile"
    echo ""
    echo "Logs:"
    echo "  - Backend: journalctl -u cloudsentry-backend -f"
    echo "  - Caddy: /var/log/caddy/access.log"
    echo ""
    echo -e "${YELLOW}IMPORTANT: Please change the JWT_SECRET in ${CLOUDSENTRY_DIR}/backend/.env${NC}"
    echo ""
    echo "To seed the database with sample data:"
    echo "  cd ${CLOUDSENTRY_DIR}/backend && npx tsx prisma/seed.ts"
    echo ""
}

# Main installation function
main() {
    echo ""
    echo "========================================="
    echo "  CloudSentry Linux Installer"
    echo "========================================="
    echo ""
    
    check_root
    detect_distro
    
    # Install packages based on distribution
    case $DISTRO in
        ubuntu|debian|linuxmint|pop)
            install_debian
            ;;
        centos|rhel|fedora|rocky|almalinux|ol)
            install_rhel
            ;;
        arch|manjaro|endeavouros)
            install_arch
            ;;
        *)
            # Check distribution family
            case $DISTRO_FAMILY in
                *debian*)
                    install_debian
                    ;;
                *rhel*|*fedora*)
                    install_rhel
                    ;;
                *arch*)
                    install_arch
                    ;;
                *)
                    print_error "Unsupported distribution: $DISTRO"
                    print_info "Supported distributions: Ubuntu, Debian, CentOS, RHEL, Fedora, Arch Linux"
                    exit 1
                    ;;
            esac
            ;;
    esac
    
    configure_postgresql
    install_cloudsentry
    configure_caddy
    create_backend_service
    print_instructions
}

# Run main function
main "$@"
