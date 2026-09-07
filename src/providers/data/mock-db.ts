import type { MockSeed } from './mock-data-provider';

const VENDOR_NAMES = [
  'Acme Supplies',
  'Bintang Logistik',
  'Cakra Teknologi',
  'Delta Perkasa',
  'Eka Mandiri',
  'Fajar Nusantara',
  'Graha Utama',
  'Harmoni Sejahtera',
  'Indo Prima',
  'Jaya Abadi',
  'Karya Bersama',
  'Lintas Cakrawala',
  'Mitra Sentosa',
  'Nusa Dua Trading',
  'Omega Industri',
  'Pelita Jaya',
  'Quantum Sarana',
  'Rajawali Mas',
  'Sinar Terang',
  'Tunas Mekar',
  'Universal Parts',
  'Vega Solusi',
  'Wijaya Kusuma',
  'Xenon Elektrik',
  'Yudha Persada',
];

const CITIES = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang'];

/**
 * Deterministic seed data for the mock provider — no faker, no randomness, so
 * screenshots and tests stay stable between runs.
 */
export const mockSeed: MockSeed = {
  vendor: VENDOR_NAMES.map((name, index) => {
    const slug = name.toLowerCase().replace(/[^a-z]+/g, '');
    const day = String((index % 28) + 1).padStart(2, '0');
    const month = String((index % 12) + 1).padStart(2, '0');

    return {
      id: index + 1,
      code: `V-${String(index + 1).padStart(3, '0')}`,
      name,
      email: `contact@${slug}.test`,
      phone: `021-${String(5500000 + index * 137).slice(0, 7)}`,
      city: CITIES[index % CITIES.length] ?? 'Jakarta',
      active: index % 4 !== 0,
      createdAt: `2026-${month}-${day}T00:00:00.000Z`,
    };
  }),
};
