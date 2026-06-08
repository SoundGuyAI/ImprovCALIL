# Set project name
$PROJECT_ID = "improv-calendar-il"
$SERVICE_ACCOUNT_NAME = "impcal-server-admin"
$SERVICE_ACCOUNT_EMAIL = "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
$SECRETS_DIR = Join-Path $PSScriptRoot "../.secrets"
$KEY_FILE = Join-Path $SECRETS_DIR "firebase-admin.json"

Write-Host "Checking gcloud authentication..." -ForegroundColor Cyan
try {
    $activeAccount = gcloud config get-value account 2>$null
    if (-not $activeAccount) {
        Write-Host "No active gcloud account found. Please run 'gcloud auth login' in your shell first." -ForegroundColor Red
        exit 1
    }
    Write-Host "Authenticated as: $activeAccount" -ForegroundColor Green
} catch {
    Write-Host "gcloud is not installed or not in PATH. Please install Google Cloud SDK or use the manual console method." -ForegroundColor Red
    exit 1
}

# Set the active project
Write-Host "Setting active project to $PROJECT_ID..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to set project to $PROJECT_ID. Do you have access to this project?" -ForegroundColor Red
    exit 1
}

# Ensure .secrets directory exists
if (-not (Test-Path $SECRETS_DIR)) {
    Write-Host "Creating .secrets directory..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $SECRETS_DIR | Out-Null
}

# Create Service Account if it doesn't exist
Write-Host "Checking if service account $SERVICE_ACCOUNT_EMAIL exists..." -ForegroundColor Cyan
$saExists = gcloud iam service-accounts list --filter="email:$SERVICE_ACCOUNT_EMAIL" --format="value(email)"
if (-not $saExists) {
    Write-Host "Creating service account $SERVICE_ACCOUNT_NAME..." -ForegroundColor Cyan
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME `
        --description="Improv Calendar IL Server Admin" `
        --display-name="Improv Calendar IL Server Admin" `
        --project=$PROJECT_ID
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create service account." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Service account $SERVICE_ACCOUNT_EMAIL already exists." -ForegroundColor Green
}

# Grant Firebase Admin role
Write-Host "Granting Firebase Admin role to service account..." -ForegroundColor Cyan
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" `
    --role="roles/firebase.admin" `
    --condition=None | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to grant role roles/firebase.admin." -ForegroundColor Red
    exit 1
}
Write-Host "Firebase Admin role granted successfully." -ForegroundColor Green

# Create and download private key
Write-Host "Generating private key at $KEY_FILE..." -ForegroundColor Cyan
if (Test-Path $KEY_FILE) {
    Write-Host "Key file already exists at $KEY_FILE. Backing up..." -ForegroundColor Yellow
    Rename-Item -Path $KEY_FILE -NewName "firebase-admin.json.bak" -Force
}

gcloud iam service-accounts keys create $KEY_FILE `
    --iam-account=$SERVICE_ACCOUNT_EMAIL `
    --project=$PROJECT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to generate private key." -ForegroundColor Red
    exit 1
}
Write-Host "Private key saved to $KEY_FILE successfully." -ForegroundColor Green

# Format key as a single-line stringified JSON for environment variable
Write-Host "Formatting key as stringified JSON for environment variables..." -ForegroundColor Cyan
$jsonContent = Get-Content -Raw -Path $KEY_FILE
$minifiedJson = $jsonContent | ConvertFrom-Json | ConvertTo-Json -Compress

Write-Host "`n=================================================================" -ForegroundColor Magenta
Write-Host "CONFIGURATION COMPLETED!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Magenta
Write-Host "`n1. Local Service Account File saved at:"
Write-Host "   $KEY_FILE" -ForegroundColor Cyan
Write-Host "`n2. Stringified Service Account JSON (for Vercel or .env.local):"
Write-Host "   Copy the line below to set your environment variable:" -ForegroundColor Yellow
Write-Host "`nFIREBASE_SERVICE_ACCOUNT_KEY='$minifiedJson'`n" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Magenta
