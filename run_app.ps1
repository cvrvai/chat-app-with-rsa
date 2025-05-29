# Start the RSA-Based Secure Messaging App
Write-Host "Starting RSA-Based Secure Messaging App..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Flask backend server..." -ForegroundColor Cyan
$backendProcess = Start-Process -FilePath "python" -ArgumentList "app.py" -WorkingDirectory $PSScriptRoot -PassThru -NoNewWindow

Write-Host ""
Write-Host "Starting React frontend development server..." -ForegroundColor Cyan
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "$PSScriptRoot\client" -PassThru -NoNewWindow

Write-Host ""
Write-Host "Both servers are now running." -ForegroundColor Green
Write-Host "Flask backend: http://localhost:5000" -ForegroundColor Yellow
Write-Host "React frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers." -ForegroundColor Red

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Clean up processes when the script is interrupted
    if ($backendProcess -and !$backendProcess.HasExited) {
        $backendProcess.Kill()
        Write-Host "Backend server stopped." -ForegroundColor Cyan
    }
    
    if ($frontendProcess -and !$frontendProcess.HasExited) {
        $frontendProcess.Kill()
        Write-Host "Frontend server stopped." -ForegroundColor Cyan
    }
}
