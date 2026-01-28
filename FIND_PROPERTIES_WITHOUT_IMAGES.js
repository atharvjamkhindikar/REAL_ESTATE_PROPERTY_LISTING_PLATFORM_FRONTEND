// Script to add images to properties without images
// Run this in browser console to identify properties needing images

// This will help identify which properties have no images
const findPropertiesWithoutImages = async () => {
    try {
        // Fetch all properties
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
                        city: property.city,
                        price: property.price
                    });
                }
            } catch (err) {
                console.log(`Error checking images for property ${property.id}`);
            }
        }

        console.log('Properties without images:');
        console.table(propertiesWithoutImages);
        return propertiesWithoutImages;
    } catch (err) {
        console.error('Error finding properties:', err);
    }
};

// Call this function to see which properties need images
findPropertiesWithoutImages();
