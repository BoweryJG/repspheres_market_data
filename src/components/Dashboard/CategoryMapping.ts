// This file handles mapping between old category structures and the new hierarchy
import { supabase } from '../../services/supabaseClient';
import { CategoryHierarchy } from '../../types';

// Map dental categories to hierarchy IDs
const dentalCategoryMap: Record<string, number> = {
  'Diagnostic': 1,
  'Preventive': 2,
  'Restorative': 3,
  'Cosmetic': 4,
  'Oral Surgery': 5,
  'Endodontic': 6,
  'Periodontic': 7,
  'Prosthodontic': 8,
  'Orthodontic': 9,
  'Implantology': 10,
  'Sleep Dentistry': 2, // Map to Preventive
  'Pediatric': 2, // Map to Preventive
  'Adjunctive': 11, // Map to Digital Dentistry
  'TMJ/Orofacial Pain': 5 // Map to Oral Surgery
};

// Map aesthetic categories to hierarchy IDs
const aestheticCategoryMap: Record<string, number> = {
  'Facial Aesthetic': 12,
  'Injectables': 13,
  'Body': 14,
  'Skin': 15,
  'Hair': 16,
  'Minimally Invasive': 17,
  'Regenerative': 18,
  'Lasers': 19,
  'Combination': 20,
  'Body Contouring': 47,
  'Skin Tightening': 49,
  'Skin Resurfacing': 48,
  'Tech-Enhanced': 17,
  'Face': 12,
  'Breast Procedures': 14,
  'Biotech': 18,
  'Facial Procedures': 12,
  'Vascular': 15,
  'Pigmentation': 51,
  'Cellulite': 49,
  'Scar/Stretch Mark': 49
};

// Function to map a procedure to hierarchy categories
export const mapProcedureToHierarchy = (
  procedure: any, 
  industry: 'dental' | 'aesthetic',
  categoryHierarchy: CategoryHierarchy[]
): number[] => {
  // Get the right category map based on industry
  const categoryMap = industry === 'dental' 
    ? dentalCategoryMap 
    : aestheticCategoryMap;
  
  // Extract category from procedure
  const categoryName = procedure.category || '';
  
  // Find the hierarchy ID for this category
  const hierarchyId = categoryMap[categoryName];
  
  if (hierarchyId) {
    // Find this category and all its parent categories
    const result: number[] = [hierarchyId];
    
    // Add parent category if this is a subcategory
    const category = categoryHierarchy.find(c => c.id === hierarchyId);
    if (category?.parent_id) {
      result.push(category.parent_id);
    }
    
    return result;
  }
  
  return [];
};

// Function to check if a procedure belongs to a hierarchy category
export const procedureBelongsToCategory = (
  procedure: any,
  categoryId: number,
  industry: 'dental' | 'aesthetic',
  categoryHierarchy: CategoryHierarchy[]
): boolean => {
  // Get category mappings for this procedure
  const hierarchyIds = mapProcedureToHierarchy(procedure, industry, categoryHierarchy);
  
  // Check if the selected category is in the hierarchy ids
  return hierarchyIds.includes(categoryId);
};
