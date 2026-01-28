# Builder Groups - Quick Reference Guide

## ✅ What's Been Implemented

### 1. Images for Builder Groups
- **Display**: Each builder group card shows an image or "📷 No Image" placeholder
- **Upload**: Admins can upload images to builder groups
- **Delete**: Admins can remove images
- **Storage**: Images are stored and retrieved from backend

### 2. Admin-Only Property Management
- **Add Properties**: Admins can add any property to a builder group by property ID
- **Remove Properties**: Admins can remove properties from groups
- **Confirmation**: Destructive actions require user confirmation
- **Visibility**: Admin controls only visible to users with `isAdmin()` permission

## 📸 Image Management Features

### For Admins:
1. **Upload Image**
   - Click "Upload Image" button
   - Select image file (JPG, PNG, WebP)
   - Max file size: 5MB
   - Click "Upload" to save

2. **View Image**
   - Image displays in admin section
   - Image also shows on group card
   - Max height: 400px in admin view
   - 200px height in group cards

3. **Delete Image**
   - Click "Delete Image" button
   - Confirm deletion
   - Image removed from backend and UI

## ➕ Property Management Features

### For Admins:
1. **Add Property to Group**
   - Click "Add Property" button
   - Enter property ID in modal
   - Click "Add Property"
   - Property appears in group's property list

2. **Remove Property from Group**
   - View group properties
   - Click "🗑️ Remove from Group" on any property
   - Confirm removal
   - Property is removed from group

## 🔐 Access Control

All admin features are protected:
```javascript
{isAdmin() && (
    // Admin sections only render here
)}
```

Non-admin users see:
- ✅ Builder groups and images
- ✅ Properties in groups
- ✅ Can add to favorites
- ❌ No admin controls
- ❌ No upload buttons
- ❌ No property management

## 📁 Files Modified

1. **src/services/api.js**
   - Added 5 new methods to builderGroupService

2. **src/components/BuilderGroupFilter.js**
   - Added state for images and properties
   - Added 6 handler functions
   - Added admin sections in JSX

3. **src/components/BuilderGroupFilter.css**
   - Added 300+ lines of styling
   - Responsive design included

## 🎨 UI Components

### Admin Section (for admins only):
- Image Management
  - Current image display with delete option
  - Upload button and file input form
  
- Property Management
  - Add Property button
  - Modal with property ID input
  - Confirmation actions

### Group Cards (for all users):
- Image placeholder/display
- Group name
- Description
- Admin buttons (edit, delete)
- Active/Inactive badge
- Property count

### Properties List:
- Property cards with images
- Favorite buttons
- Admin remove button (admin only)

## 🚀 How to Use

### As an Admin:

**To upload an image:**
1. Open Builder Groups page
2. Select a builder group
3. Scroll to "Admin: Group Image" section
4. Click "Upload Image"
5. Select an image file
6. Click "Upload"

**To add a property:**
1. Select a builder group
2. Scroll to "Admin: Add Property to Group"
3. Click "Add Property"
4. Enter property ID (e.g., 1, 2, 3)
5. Click "Add Property" in modal

**To remove a property:**
1. View group properties
2. Find the property
3. Click "🗑️ Remove from Group" button
4. Confirm removal

### As a Regular User:
1. Browse builder groups
2. Click on a group to view its properties
3. See all properties in that group
4. Add properties to favorites
5. View group images

## 📝 Code Examples

### Fetch Group Image
```javascript
const response = await builderGroupService.getBuilderGroupImage(groupId);
const imageData = response.data.data || response.data;
```

### Upload Image
```javascript
const formData = new FormData();
formData.append('file', imageFile);
await builderGroupService.uploadBuilderGroupImage(groupId, formData);
```

### Add Property to Group
```javascript
await builderGroupService.addPropertyToGroup(groupId, propertyId);
```

### Remove Property from Group
```javascript
await builderGroupService.removePropertyFromGroup(groupId, propertyId);
```

## ✨ Features

- ✅ Upload images for builder groups
- ✅ Display images on group cards
- ✅ Delete images
- ✅ Add properties to groups (admin only)
- ✅ Remove properties from groups (admin only)
- ✅ Image validation (type and size)
- ✅ Confirmation dialogs for destructive actions
- ✅ Responsive design
- ✅ Professional UI/UX
- ✅ Error handling

## 🛡️ Security Features

- Admin-only operations protected with `isAdmin()` checks
- File validation for image uploads
- File size limit (5MB)
- Confirmation dialogs for destructive actions
- Proper error handling and user feedback

## 🎯 Next Steps

1. Test image upload functionality
2. Test property management features
3. Verify admin access controls
4. Test on different screen sizes
5. Verify error handling scenarios
