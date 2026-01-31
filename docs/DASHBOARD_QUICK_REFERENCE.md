# Quick Reference - Agent & Admin Dashboards

## Agent Dashboard (/agent-dashboard)

### What You See:
- **Header:** Agent's name + Add Property button + Logout
- **Statistics:** Total properties, For Sale count, For Rent count
- **Property Cards:** All your properties with action buttons
- **Action Buttons:** Add/Edit Images, Edit, Delete

### What You Can Do:
1. **Add Property** → Click "Add Property" → Fill form → Create
2. **Add Images** → Click "Add/Edit Images" → Select files → Upload
3. **Edit Property** → Click "Edit" → Update fields → Save
4. **Delete Property** → Click "Delete" → Confirm → Removed

### Image Upload:
- Click "Add/Edit Images" on any property
- Select multiple images (up to 5MB each)
- See previews before uploading
- Remove unwanted images
- First image becomes primary
- Click "Upload Images"

### How to Access:
1. Login as AGENT
2. Automatically taken to agent dashboard
3. Or type: http://localhost:3000/agent-dashboard

---

## Admin Dashboard (/admin-dashboard)

### What You See:
- **Header:** Admin name + Add Property button + Logout
- **Controls:** Search box + Property Type filter
- **Table:** All properties with owner info
- **Pagination:** Navigate through property pages

### What You Can Do:
1. **Search** → Type title/address/city → See results
2. **Filter** → Select property type → See filtered properties
3. **Edit** → Click edit icon → Update all details → Save
4. **Delete** → Click delete icon → Confirm → Removed
5. **Paginate** → Click Previous/Next → See more properties

### Property Table Columns:
- Title
- Owner (Name)
- Price (in INR)
- Address
- Property Type
- Beds/Baths
- Status (Active/Inactive)
- Actions (Edit/Delete)

### How to Access:
1. Login as ADMIN
2. Type: http://localhost:3000/admin-dashboard
3. Or click link in navbar (if added)

---

## File Structure

```
src/components/
├── AgentDashboard.js         ← Agent dashboard component
├── AgentDashboard.css        ← Agent dashboard styles
├── AdminDashboard.js         ← Admin dashboard component
├── AdminDashboard.css        ← Admin dashboard styles
├── PropertyCard.js           ← Property card component
├── AddProperty.js            ← Add property form
├── App.js                    ← Routes configuration
└── ...other components
```

---

## Key Features Summary

### Image Upload
✅ Multiple images at once
✅ Live preview
✅ File validation (5MB max)
✅ Primary image auto-selection
✅ Remove before upload
✅ Success/error messages

### Property Management
✅ Create properties
✅ Edit all fields
✅ Delete with confirmation
✅ Filter and search
✅ Pagination
✅ Owner tracking
✅ Status display

### Responsive UI
✅ Desktop optimized
✅ Tablet friendly
✅ Mobile responsive
✅ Touch-friendly buttons
✅ Scrollable tables

---

## Navigation

### From Agent Dashboard:
- "Add Property" → Goes to `/add-property`
- "Logout" → Logs out + back to home
- Property card → Click to view details

### From Admin Dashboard:
- "Add Property" → Goes to `/add-property`
- "Logout" → Logs out + back to home
- Edit icon → Edit modal opens
- Delete icon → Confirm + delete

---

## Response Messages

### Success Messages:
- "1 image(s) uploaded successfully!"
- "Property updated successfully!"
- "Property deleted successfully!"

### Error Messages:
- "Failed to load properties"
- "Failed to upload images"
- "Failed to update property"
- "Failed to delete property"

---

## Database Integration

### All Changes Saved To Database:
✅ New properties
✅ Updated properties
✅ Deleted properties
✅ Uploaded images
✅ Image metadata
✅ Owner relationships
✅ Timestamps

### API Endpoints Called:
```
Agent Dashboard:
- GET /properties/available?page=0&size=100
- POST /properties/{id}/images
- PUT /properties/{id}
- DELETE /properties/{id}

Admin Dashboard:
- GET /properties?page=0&size=10
- PUT /properties/{id}
- DELETE /properties/{id}
```

---

## User Roles

### AGENT:
- View own properties only
- Add properties
- Upload images
- Edit own properties
- Delete own properties

### ADMIN:
- View all properties
- Edit any property
- Delete any property
- Search/filter properties
- Manage users
- Manage subscriptions

### USER:
- View all properties
- Add to favorites
- Schedule viewings
- See property details
- Contact agents

---

## Troubleshooting

### Dashboard shows blank page:
1. Check if you're logged in
2. Check if you have correct role (AGENT/ADMIN)
3. Refresh page (F5)
4. Check browser console for errors

### Images not uploading:
1. Check file size (< 5MB)
2. Check file format (JPG, PNG, GIF, WebP)
3. Check internet connection
4. Try uploading fewer images at once

### Properties not showing:
1. Check if you're logged in
2. For agents: You need to be the owner
3. For admins: Should see all properties
4. Try refreshing page
5. Check browser console for errors

### Pagination not working:
1. Check if there are more properties
2. Try clicking Previous/Next
3. Refresh page
4. Check network tab for API errors

---

## Keyboard Shortcuts

- **F12** - Open developer console
- **Ctrl+R** - Refresh page
- **Escape** - Close modals
- **Tab** - Navigate form fields

---

## Tips & Tricks

1. **Image Upload:** Drag-drop images onto file input
2. **Search:** Type slowly for better results
3. **Filter:** Change filter to see different property types
4. **Pagination:** Page size is 10 properties per page
5. **Edit:** All fields are editable including price
6. **Delete:** Confirmation prevents accidents
7. **Images:** First image selected becomes primary

---

## Status
✅ **COMPLETE AND WORKING!**

Both dashboards are fully functional and integrated with backend!
