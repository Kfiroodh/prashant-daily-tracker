# PocketBase Setup Guide for PRASHANT

PocketBase is a self-hosted backend that stores all app data locally. Follow these steps to set up the required collections.

## Quick Start

1. **PocketBase is already running** at `http://127.0.0.1:8090`
2. **Open admin UI**: http://127.0.0.1:8090/_/
3. **Create an admin user** (if you haven't already): Click "Setup admin" and create admin@example.com / 12345678

## Collections to Create

Create these 5 collections in PocketBase admin UI. For each collection:
1. Go to **Collections** → **New collection**
2. Name it and add the fields listed below
3. **Rules**: Leave as default (everyone can read/write authenticated records)

### 1. `messages` - One-to-one chat messages
**Fields**:
- `chatId` (text, required) - Format: "uid1_uid2" (sorted IDs)
- `senderId` (text, required) - Sender's user ID
- `senderName` (text, required) - Sender's display name  
- `type` (text, required) - "text", "image", or "file"
- `text` (text, optional) - Message content
- `file` (file, optional) - Attached photo/document

### 2. `shared` - Photo/file sharing
**Fields**:
- `title` (text, required) - What's being shared
- `description` (text, optional) - Details
- `file` (file, optional) - The photo/file
- `sharedBy` (text, required) - Sharer's user ID
- `sharedByName` (text, required) - Sharer's name
- `likes` (number, optional) - Like count

### 3. `friendRequests` - Friend request system
**Fields**:
- `from` (text, required) - Requester's user ID
- `fromName` (text, required) - Requester's name
- `to` (text, required) - Recipient's user ID
- `status` (text, required) - "pending", "accepted", or "rejected"

### 4. `groupChats` - Circle/group chats
**Fields**:
- `name` (text, required) - Group name (e.g., "Class 12A", "Study Group")
- `createdBy` (text, required) - Creator's user ID
- `members` (json, required) - Member array: `[{"id": "uid", "joined": "2026-02-09"}]`

### 5. `groupMessages` - Group chat messages
**Fields**:
- `groupId` (text, required) - Group's ID
- `senderId` (text, required) - Sender's user ID
- `senderName` (text, required) - Sender's name
- `type` (text, required) - "text", "image", or "file"
- `text` (text, optional) - Message content  
- `file` (file, optional) - Attached file

## Using the App

### How to Use Features:

**1. Sign Up / Login**
- Enter email (any) and password (min 6 chars)
- First time = new account created automatically

**2. Add Friends**
- Go to **Friends tab** → See all users, pending requests, friend suggestions
- Click **"अनुरोध भेजें"** (Send Request) to any user
- They see it under "नए अनुरोध" (New Requests) and can accept/reject

**3. Message Friends**
- After accepting friend request, click **💬 Chat**
- Send text messages or upload photos/files

**4. Create Group Chat**
- In **Chat tab**, create a circle (group)
- Add friends and discuss together
- All members see messages in real-time

**5. Share Photos & Notes**
- **Share tab** → Upload photo/file + add title/description
- Friends can download and like your shares

## Troubleshooting

**Chat not showing messages?**
- ✅ Ensure `messages` collection exists
- ✅ Check PocketBase is running: `.\pocketbase.exe serve`
- ✅ Browser console (F12) for errors

**Friends list empty?**
- ✅ Sign in with multiple test accounts
- ✅ Accounts must exist in `users` collection (auto-created on signup)

**File upload fails?**
- ✅ Check `file` field is type "file" in each collection
- ✅ Ensure PocketBase storage directory has write permissions

**Collection auto-create?**
- PocketBase can auto-create collections on first API call (if rules allow)
- Better to create manually in admin UI for reliability

## Admin Dashboard

Access PocketBase admin:
- URL: http://127.0.0.1:8090/_/
- Email: admin@example.com
- Password: 12345678

Here you can:
- View all records
- Export/backup data
- Manage users
- Edit collection schemas
- Set custom rules

## Backup & Data

PocketBase stores data in `pb_data/` folder. To backup:
```bash
# Copy the directory
Copy-Item -Path "pb_data" -Destination "pb_data_backup" -Recurse
```

To reset (delete all data):
```bash
# Delete pb_data folder and restart PocketBase
Remove-Item -Path "pb_data" -Recurse -Force
.\pocketbase.exe serve
```
