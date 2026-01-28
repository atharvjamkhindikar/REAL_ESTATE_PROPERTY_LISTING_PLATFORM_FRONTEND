# 🚀 Quick Reference Guide - Property CRUD Operations

## 📋 Quick Commands

### Start Development Server
```powershell
cd "D:\CDAC Project\Atharva\Atharva\real-estate-frontend"
npm start
```

### Test CRUD Operations
1. Login as **AGENT** or **ADMIN**
2. Navigate to dashboard
3. See Edit/Delete buttons on your properties

---

## 🔑 User Roles & Permissions

| Role   | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| ADMIN  | ✅     | ✅   | ✅ All | ✅ All |
| AGENT  | ✅     | ✅   | ✅ Own | ✅ Own |
| OWNER  | ✅     | ✅   | ✅ Own | ✅ Own |
| BUYER  | ❌     | ✅   | ❌     | ❌     |

---

## 📁 Component Files

### CRUD Components
```
src/components/
├── AddProperty.js       → CREATE (✅ Working)
├── PropertyList.js      → READ ALL (✅ Working)
├── PropertyDetail.js    → READ ONE (✅ Working)
├── EditProperty.js      → UPDATE (✅ NEW)
└── PropertyCard.js      → With Edit/Delete buttons (✅ Updated)
```

### Routes
```javascript
/add-property              → Create new property
/property/:id              → View property details
/edit-property/:id         → Edit existing property
// Delete via button (no route)
```

---

## 🎯 Testing Scenarios

### Test as AGENT
1. **Create**: `/add-property` → Fill form → Submit
2. **Read**: `/` → See all properties
3. **Update**: Click "Edit" on own property → Modify → Save
4. **Delete**: Click "Delete" on own property → Confirm

### Test as BUYER
- Should NOT see Edit/Delete buttons
- Can only view properties

---

## 🔧 Backend Endpoints Used

```javascript
// Already implemented in backend
POST   /api/properties          → propertyService.createProperty()
GET    /api/properties/:id      → propertyService.getPropertyById()
PUT    /api/properties/:id      → propertyService.updateProperty()
DELETE /api/properties/:id      → propertyService.deleteProperty()
```

---

## 🎨 UI Features

### Property Card Actions
```jsx
<PropertyCard 
    property={property}
    showActions={true}        // Shows Edit/Delete buttons
    onDelete={handleDelete}   // Callback after deletion
/>
```

### Edit/Delete Buttons (Auto-shown based on role)
```javascript
{canEditOrDelete() && (
    <div className="edit-delete-buttons">
        <button onClick={handleEdit}>✏️ Edit Property</button>
        <button onClick={handleDelete}>🗑️ Delete Property</button>
    </div>
)}
```

---

## 📝 Common Tasks

### Add Edit/Delete to New Page
```javascript
import { propertyService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
    const { user } = useAuth();
    
    const canEditOrDelete = (property) => {
        if (!user) return false;
        const isAdmin = user.userType === 'ADMIN';
        const isAgent = user.userType === 'AGENT';
        const isOwner = property.owner?.id === user.id;
        return isAdmin || isAgent || isOwner;
    };
    
    const handleDelete = async (propertyId) => {
        if (!confirm('Delete?')) return;
        await propertyService.deleteProperty(propertyId);
        // Refresh list
    };
    
    return (
        <>
            {canEditOrDelete(property) && (
                <button onClick={() => navigate(`/edit-property/${property.id}`)}>
                    Edit
                </button>
            )}
        </>
    );
};
```

---

## 🐛 Troubleshooting

### Edit/Delete buttons not showing?
✅ Check user is logged in  
✅ Verify user role (not BUYER)  
✅ Confirm property ownership  

### Delete not working?
✅ Backend running on port 8080?  
✅ CORS configured correctly?  
✅ Check browser console for errors  

### Edit page blank?
✅ Property ID in URL correct?  
✅ User has permission?  
✅ Property exists in database?  

---

## 🎉 Success Indicators

When everything is working:
- ✅ AGENT sees Edit/Delete on own properties
- ✅ ADMIN sees Edit/Delete on all properties
- ✅ BUYER sees NO Edit/Delete buttons
- ✅ Edit form pre-fills with property data
- ✅ Delete shows confirmation dialog
- ✅ Changes reflect in database
- ✅ UI updates after operations

---

## 📞 Need Help?

Check these files:
- `CRUD_OPERATIONS_COMPLETE.md` - Full documentation
- `AGENT_DASHBOARD_CREATION_COMPLETE.md` - Dashboard guide
- `BACKEND_INTEGRATION_GUIDE.md` - API integration

---

**Status**: ✅ **ALL CRUD OPERATIONS WORKING!**

Last Updated: January 28, 2026
