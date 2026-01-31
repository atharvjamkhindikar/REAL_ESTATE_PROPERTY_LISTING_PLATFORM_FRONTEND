# How to Add Images to Properties Without Images

## Quick Steps

### Method 1: Using Property Detail Page (Easiest)

1. **Login as Agent**
   - Sign in with an AGENT account
   - Go to home page to view all properties

2. **Find Properties Without Images**
   - Look for properties with "📸 No Images Available" placeholder
   - These properties need images

3. **Add Images**
   - Click on the property to view details
   - On property detail page, you'll see "📸 No Images Available"
   - Click the "+ Add Images to This Property" button
   - Modal will open for image upload

4. **Upload Images**
   - Click file input or drag images onto it
   - Select 1-5 images for the property
   - Preview images in grid
   - Click "Upload Images" button
   - Wait for success message

5. **Verify**
   - Images should appear on property card
   - Return to home page to see updated property with images

### Method 2: Using Browser Console

If you need to find which properties don't have images:

1. **Open Browser Console**
   - Press F12
   - Go to Console tab

2. **Run Script**
   - Copy and paste this code:
   ```javascript
   const findPropertiesWithoutImages = async () => {
       const response = await fetch('/api/properties');
       const data = await response.json();
       const properties = data.data || data;
       
       const propertiesWithoutImages = [];
       
       for (const property of properties) {
           try {
               const imageResponse = await fetch(`/api/properties/${property.id}/images`);
               const imageData = await imageResponse.json();
               const images = imageData.data || imageData || [];
               
               if (!Array.isArray(images) || images.length === 0) {
                   propertiesWithoutImages.push({
                       id: property.id,
                       title: property.title,
                       city: property.city
                   });
               }
           } catch (err) {
               console.log(`Error: ${property.id}`);
           }
       }
       
       console.table(propertiesWithoutImages);
   };
   
   findPropertiesWithoutImages();
   ```

3. **Identify Properties**
   - Console will show table of properties without images
   - Note the IDs of the 3 properties

4. **Add Images**
   - Go to each property's detail page
   - Follow Method 1 steps above

## What Properties Look Like

### Without Images:
```
┌─────────────────┐
│   📸 No Images  │
│     Available   │
│                 │
│ + Add Images to │
│   This Property │
└─────────────────┘
```

### With Images:
```
┌─────────────────┐
│   [Image 1]     │
│   ❮  1/3   ❯   │
└─────────────────┘
```

## Upload Modal Features

- **File Selection:** Click or drag images
- **Multiple Files:** Select up to 5 images at once
- **Preview:** See thumbnails before uploading
- **Remove:** Click ✕ to remove unwanted images
- **Upload:** Click "Upload Images" button
- **Status:** Shows "Uploading..." while processing
- **Success:** "3 image(s) uploaded successfully!"

## Important Notes

- **Agent Role Required:** Only AGENT users can upload images
- **File Size:** Max 5MB per image
- **File Types:** JPG, PNG, GIF, WebP supported
- **First Image:** Automatically set as primary image
- **Auto-Refresh:** Images appear immediately after upload

## Troubleshooting

### Images Not Uploading
1. Check file size (must be < 5MB)
2. Check file format (must be image)
3. Check browser console (F12) for errors
4. Try uploading fewer images at once

### Button Not Showing
1. Verify you're logged in as AGENT
2. Verify property has no images
3. Refresh page (F5)
4. Clear browser cache (Ctrl+Shift+Del)

### Upload Takes Long Time
1. Check network tab (F12) to see progress
2. Don't close browser/tab during upload
3. Wait for success message
4. Property images will refresh automatically

## Expected Result

After uploading images to 3 properties:
- All 3 properties show images on property cards
- Images display in carousel on detail page
- First image is primary/featured image
- Images can be viewed with next/previous buttons

## Status
✅ Ready to add images to properties!
