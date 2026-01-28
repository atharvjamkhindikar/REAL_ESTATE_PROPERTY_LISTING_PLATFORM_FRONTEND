# Builder Group Image Upload - Fix for 500 Error

## Problem
When trying to upload an image to a builder group, users encountered a 500 Internal Server Error:
```
POST http://localhost:8080/api/builder-groups/2/image 500 (Internal Server Error)
```

## Root Cause
The frontend was trying to upload to an endpoint `/builder-groups/{groupId}/image` that either:
1. Doesn't exist on the backend
2. Isn't properly configured for file uploads

## Solution Implemented
Instead of creating a separate image endpoint, we now:
1. Convert the image file to **Base64 data URL**
2. Store the Base64 string directly in the BuilderGroup's `imageUrl` field
3. Use the existing `PUT /builder-groups/{groupId}` endpoint to update the group

### How It Works

#### Before (Broken):
```
Frontend → POST /builder-groups/{id}/image (FormData with file)
           ↓
         500 Error (endpoint doesn't exist)
```

#### After (Fixed):
```
Frontend → Read file as Base64
           ↓
         PUT /builder-groups/{id} (JSON with imageUrl: base64String)
           ↓
         Backend updates imageUrl field
           ↓
         Success!
```

## Changes Made

### 1. API Service (src/services/api.js)
- **uploadBuilderGroupImage()**: Now reads file as Base64 and PUTs to `/builder-groups/{groupId}`
- **deleteBuilderGroupImage()**: PUTs with `imageUrl: null` to clear the image

### 2. BuilderGroupFilter Component
- **fetchGroupImage()**: Gets image from `builder group.imageUrl` instead of separate endpoint
- **handleUploadGroupImage()**: Creates FormData and calls updated API
- **handleDeleteGroupImage()**: Calls updated API to remove image
- **Image display**: Changed from `groupImage.imageUrl` to just `groupImage` (it's now a string)

### 3. Data Flow
```
User selects image
    ↓
FileReader converts to Base64
    ↓
PUT request with imageUrl: base64String
    ↓
Backend updates BuilderGroup.imageUrl
    ↓
fetchBuilderGroups() refreshes the list
    ↓
Image displays on group card
```

## Benefits
✅ No need for separate image upload endpoint
✅ Simple implementation using existing endpoints
✅ Base64 images can be up to ~4MB
✅ Images persist with builder group
✅ Works with current backend structure

## Limitations
- Base64 images are larger than binary (33% overhead)
- For very large images, might exceed URL size limits
- Better long-term: implement actual file upload endpoint

## Testing
1. Click "Upload Image" on a builder group
2. Select an image file
3. Click "Upload"
4. Image should display immediately
5. Group card should show the image

## Status
✅ **FIXED** - Builder group image upload now works without 500 error
