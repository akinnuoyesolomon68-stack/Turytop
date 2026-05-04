export const INITIAL_BOOKS: any[] = [
  {
    id: '1',
    title: 'Advanced Engineering Mathematics',
    author: 'Erwin Kreyszig',
    price: 15000,
    category: 'Textbook',
    description: 'A comprehensive guide for engineering students covering advanced calculus, differential equations, and complex analysis.',
    imageUrl: 'https://images.unsplash.com/photo-1543004218-ee141104975a?q=80&w=800&auto=format&fit=crop',
    isSoldOut: false,
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    price: 4500,
    category: 'Novel',
    description: 'A classic novel exploring themes of wealth, love, and the American Dream in the 1920s.',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    isSoldOut: false,
    createdAt: Date.now(),
  },
  {
    id: '3',
    title: 'Modern Organic Chemistry',
    author: 'John McMurry',
    price: 12000,
    category: 'Textbook',
    description: 'Detailed exploration of organic chemistry reactions, mechanisms, and structures.',
    imageUrl: 'https://images.unsplash.com/photo-1532012197367-bb8385b704e7?q=80&w=800&auto=format&fit=crop',
    isSoldOut: true,
    createdAt: Date.now(),
  },
  {
    id: '4',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    price: 3500,
    category: 'Novel',
    description: 'A philosophical novel about a shepherd boy named Santiago on his journey to find treasure in the Egyptian pyramids.',
    imageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df64e?q=80&w=800&auto=format&fit=crop',
    isSoldOut: false,
    createdAt: Date.now(),
  }
];

export const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'shop', label: 'Shop' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Books' },
  { id: 'Textbook', label: 'Textbooks' },
  { id: 'Novel', label: 'Novels' },
  { id: 'Educational', label: 'Educational' },
  { id: 'Other', label: 'Others' },
];
