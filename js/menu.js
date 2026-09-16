// Orders are open weekly from ORDER_OPEN_DAY/ORDER_OPEN_HOUR up to (not including)
// ORDER_CLOSE_DAY/ORDER_CLOSE_HOUR, Asia/Kolkata time. Days are 3-letter (Sun..Sat),
// hours are 24-hour, so 0 = 12:00 AM, 18 = 6:00 PM.
const ORDER_OPEN_DAY = 'Thu';
const ORDER_OPEN_HOUR = 10;
const ORDER_CLOSE_DAY = 'Fri';
const ORDER_CLOSE_HOUR = 18;

const menu = [
  { id: 'veg',    name: 'Veg Momo',     price: 120, type: 'veg',    isVeg: true,  pieces: 8, freePieces: 0, category: 'momo' },
  { id: 'nonveg', name: 'Non-Veg Momo', price: 150, type: 'nonveg', isVeg: false, pieces: 8, freePieces: 0, category: 'momo' },
  { id: 'keema-noodles', name: 'Chicken Keema Noodles', price: 280, isVeg: false, category: 'noodles' },
];