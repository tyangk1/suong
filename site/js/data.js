// Fictional brand: prices and origins are design copy, nothing is sold.
export const TEAS = [
  {
    id: 'luc', name: 'Lục trà Thái Nguyên', short: 'Lục trà', origin: 'Đồi chè Thái Nguyên',
    notes: 'Hương cốm non, chát dịu đầu lưỡi rồi ngọt dần nơi cổ họng.',
    temp: 80, grams: 5, time: '1 phút', steeps: 4, liquor: '#C9C77E',
    price50: 180000, price100: 320000, img: 'tea-luc', leaf: 'leaf-luc',
  },
  {
    id: 'sen', name: 'Trà Sen Tây Hồ', short: 'Trà Sen', origin: 'Hồ Tây, Hà Nội',
    notes: 'Lục trà ướp gạo sen qua nhiều đêm, hương sen thanh bay lên từ chén nóng.',
    temp: 85, grams: 5, time: '1 phút 30 giây', steeps: 3, liquor: '#D9C98A',
    price50: 450000, price100: 850000, img: 'tea-sen', leaf: 'leaf-sen',
  },
  {
    id: 'shan', name: 'Shan Tuyết', short: 'Shan Tuyết', origin: 'Núi cao Hà Giang',
    notes: 'Búp chè cổ thụ phủ lông tuyết, nước vàng óng, vị ngọt dày như mật.',
    temp: 90, grams: 4, time: '2 phút', steeps: 5, liquor: '#D4A55A',
    price50: 260000, price100: 480000, img: 'tea-shan', leaf: 'leaf-shan',
  },
  {
    id: 'olong', name: 'Ô Long', short: 'Ô Long', origin: 'Cao nguyên Lâm Đồng',
    notes: 'Viên chè cuộn chặt nở dần qua từng nước, hương hoa và mật ong.',
    temp: 95, grams: 7, time: '50 giây', steeps: 6, liquor: '#B87A3A',
    price50: 220000, price100: 400000, img: 'tea-olong', leaf: 'leaf-olong',
  },
];

export const BOX = { id: 'hop', name: 'Hộp bốn vị', detail: '4 gói × 25 g', price: 590000 };
export const SET = { name: 'Bộ ấm chén Sớm', price: 690000 };

export const byId = (id) => TEAS.find((t) => t.id === id) || TEAS[0];
