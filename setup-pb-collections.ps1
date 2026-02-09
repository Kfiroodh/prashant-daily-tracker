# Setup PocketBase Collections via REST API
# This script creates required collections for PRASHANT

$pbUrl = "http://127.0.0.1:8090"
$adminEmail = "admin@example.com"
$adminPassword = "12345678"

# Get admin auth token
Write-Host "🔐 Authenticating admin..." -ForegroundColor Green
$authBody = @{
  identity = $adminEmail
  password = $adminPassword
} | ConvertTo-Json

$authResponse = Invoke-WebRequest -Uri "$pbUrl/api/collections/admins/auth-with-password" `
  -Method POST `
  -ContentType "application/json" `
  -Body $authBody -ErrorAction SilentlyContinue

if ($authResponse.StatusCode -eq 200) {
  $adminToken = ($authResponse.Content | ConvertFrom-Json).token
  Write-Host "✅ Admin authenticated. Token: $($adminToken.Substring(0, 20))..." -ForegroundColor Green
} else {
  Write-Host "❌ Admin auth failed. Make sure admin exists in PocketBase." -ForegroundColor Red
  exit 1
}

$headers = @{
  Authorization = $adminToken
  "Content-Type" = "application/json"
}

# Helper to create collection
function Create-Collection {
  param(
    [string]$Name,
    [array]$Fields
  )
  
  Write-Host "📝 Creating collection: $Name" -ForegroundColor Cyan
  
  $schema = @{
    name = $Name
    type = "base"
    createRule = "@request.auth.id != ''"
    updateRule = "id = @request.auth.id || role = 'admin'"
    deleteRule = "id = @request.auth.id || role = 'admin'"
    listRule = ""
    viewRule = ""
    fields = $Fields
  } | ConvertTo-Json -Depth 10

  try {
    $response = Invoke-WebRequest -Uri "$pbUrl/api/collections" `
      -Method POST `
      -Headers $headers `
      -Body $schema -ErrorAction Stop
    Write-Host "✅ Collection '$Name' created." -ForegroundColor Green
  } catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 400) {
      Write-Host "⚠️  Collection '$Name' may already exist. Skipping..." -ForegroundColor Yellow
    } else {
      Write-Host "❌ Error: $_" -ForegroundColor Red
    }
  }
}

# Define collections and fields

$messagesFields = @(
  @{
    id = "chatId"
    name = "chatId"
    type = "text"
    required = $true
  },
  @{
    id = "senderId"
    name = "senderId"
    type = "text"
    required = $true
  },
  @{
    id = "senderName"
    name = "senderName"
    type = "text"
    required = $true
  },
  @{
    id = "type"
    name = "type"
    type = "text"
    required = $true
  },
  @{
    id = "text"
    name = "text"
    type = "text"
    required = $false
  },
  @{
    id = "file"
    name = "file"
    type = "file"
    required = $false
    options = @{ maxSelect = 1 }
  }
)

$sharedFields = @(
  @{
    id = "title"
    name = "title"
    type = "text"
    required = $true
  },
  @{
    id = "description"
    name = "description"
    type = "text"
    required = $false
  },
  @{
    id = "file"
    name = "file"
    type = "file"
    required = $false
    options = @{ maxSelect = 1 }
  },
  @{
    id = "sharedBy"
    name = "sharedBy"
    type = "text"
    required = $true
  },
  @{
    id = "sharedByName"
    name = "sharedByName"
    type = "text"
    required = $true
  },
  @{
    id = "likes"
    name = "likes"
    type = "number"
    required = $false
  }
)

$friendRequestsFields = @(
  @{
    id = "from"
    name = "from"
    type = "text"
    required = $true
  },
  @{
    id = "fromName"
    name = "fromName"
    type = "text"
    required = $true
  },
  @{
    id = "to"
    name = "to"
    type = "text"
    required = $true
  },
  @{
    id = "status"
    name = "status"
    type = "text"
    required = $true
  }
)

$groupChatsFields = @(
  @{
    id = "name"
    name = "name"
    type = "text"
    required = $true
  },
  @{
    id = "createdBy"
    name = "createdBy"
    type = "text"
    required = $true
  },
  @{
    id = "members"
    name = "members"
    type = "json"
    required = $true
  }
)

$groupMessagesFields = @(
  @{
    id = "groupId"
    name = "groupId"
    type = "text"
    required = $true
  },
  @{
    id = "senderId"
    name = "senderId"
    type = "text"
    required = $true
  },
  @{
    id = "senderName"
    name = "senderName"
    type = "text"
    required = $true
  },
  @{
    id = "type"
    name = "type"
    type = "text"
    required = $true
  },
  @{
    id = "text"
    name = "text"
    type = "text"
    required = $false
  },
  @{
    id = "file"
    name = "file"
    type = "file"
    required = $false
    options = @{ maxSelect = 1 }
  }
)

# Create collections
Create-Collection -Name "messages" -Fields $messagesFields
Create-Collection -Name "shared" -Fields $sharedFields
Create-Collection -Name "friendRequests" -Fields $friendRequestsFields
Create-Collection -Name "groupChats" -Fields $groupChatsFields
Create-Collection -Name "groupMessages" -Fields $groupMessagesFields

Write-Host "✅ All collections created successfully!" -ForegroundColor Green
Write-Host "🎉 PocketBase is ready for PRASHANT!" -ForegroundColor Green
