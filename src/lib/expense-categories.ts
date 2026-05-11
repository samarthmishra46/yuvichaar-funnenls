export interface SubCategory {
  value: string;
  label: string;
}

export interface CategoryGroup {
  value: string;
  label: string;
  color: string;
  subcategories: SubCategory[];
}

export const EXPENSE_CATEGORIES: CategoryGroup[] = [
  {
    value: 'shoot_production',
    label: 'Shoot Production',
    color: '#e91e8c',
    subcategories: [
      { value: 'location_stay', label: 'Location & Stay (Airbnb / Studio / Venue)' },
      { value: 'dop_camera', label: 'DOP / Camera Team (DOP fees, Mic)' },
      { value: 'creator_talent', label: 'Creator / Talent Expenses' },
      { value: 'miscellaneous', label: 'Miscellaneous (Travel / Food / Props / Courier)' },
    ],
  },
  {
    value: 'post_production',
    label: 'Post-Production',
    color: '#8b5cf6',
    subcategories: [
      { value: 'video_editing', label: 'Video Editing' },
      { value: 'creative_design', label: 'Creative Design (Image / Thumbnail / Social)' },
    ],
  },
  {
    value: 'software_saas',
    label: 'Software & SaaS',
    color: '#3b82f6',
    subcategories: [
      { value: 'yuvichaar_tools', label: 'Tools & Subscriptions (Yuvichaar)' },
      { value: 'brand_tools', label: 'Tools & Subscriptions (Brand)' },
    ],
  },
  {
    value: 'website_tech',
    label: 'Website & Tech',
    color: '#06b6d4',
    subcategories: [
      { value: 'website_costs', label: 'Hosting / Domain / Funnel Software / Maintenance' },
    ],
  },
  {
    value: 'other',
    label: 'Other',
    color: '#64748b',
    subcategories: [
      { value: 'misc', label: 'Miscellaneous' },
    ],
  },
];

export const ALL_CATEGORY_VALUES = EXPENSE_CATEGORIES.map((c) => c.value);

export const ALL_SUBCATEGORY_VALUES = EXPENSE_CATEGORIES.flatMap((c) =>
  c.subcategories.map((s) => s.value)
);

export function getCategoryLabel(value: string): string {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.label || value;
}

export function getCategoryColor(value: string): string {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.color || '#64748b';
}

export function getSubcategoryLabel(category: string, subcategory: string): string {
  const cat = EXPENSE_CATEGORIES.find((c) => c.value === category);
  return cat?.subcategories.find((s) => s.value === subcategory)?.label || subcategory;
}

export function getSubcategoriesFor(category: string): SubCategory[] {
  return EXPENSE_CATEGORIES.find((c) => c.value === category)?.subcategories || [];
}
