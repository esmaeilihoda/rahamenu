$headers = @{
    'X-Restaurant-Id' = 'demo-cafe'
    'Content-Type' = 'application/json'
}

$response = Invoke-WebRequest -Uri 'https://rahamenu.onrender.com/api/v1/vibes' -Headers $headers
Write-Host "Status: " $response.StatusCode
Write-Host "Content:"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
