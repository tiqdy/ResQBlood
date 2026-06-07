export const PMI_BRANCHES: Record<string, string[]> = {
  'Aceh': [
    'UDD PMI Kota Banda Aceh',
    'UDD PMI Kabupaten Aceh Utara',
    'UDD PMI Kabupaten Pidie'
  ],
  'Bali': [
    'UDD PMI Provinsi Bali (Denpasar)',
    'UDD PMI Kabupaten Buleleng',
    'UDD PMI Kabupaten Gianyar'
  ],
  'Banten': [
    'UDD PMI Kota Tangerang',
    'UDD PMI Kabupaten Tangerang',
    'UDD PMI Kota Cilegon',
    'UDD PMI Kota Serang'
  ],
  'Bengkulu': [
    'UDD PMI Kota Bengkulu'
  ],
  'D.I. Yogyakarta': [
    'UDD PMI Kota Yogyakarta',
    'UDD PMI Kabupaten Sleman',
    'UDD PMI Kabupaten Bantul',
    'UDD PMI Kabupaten Kulon Progo',
    'UDD PMI Kabupaten Gunungkidul'
  ],
  'D.K.I. Jakarta': [
    'UDD PMI Provinsi DKI Jakarta (Senen)',
    'UDD PMI Kota Jakarta Utara',
    'UDD PMI Kota Jakarta Barat',
    'UDD PMI Kota Jakarta Timur',
    'UDD PMI Kota Jakarta Selatan'
  ],
  'Gorontalo': [
    'UDD PMI Kota Gorontalo'
  ],
  'Jambi': [
    'UDD PMI Kota Jambi'
  ],
  'Jawa Barat': [
    'UDD PMI Kota Bandung',
    'UDD PMI Kota Bogor',
    'UDD PMI Kota Bekasi',
    'UDD PMI Kota Depok',
    'UDD PMI Kota Sukabumi',
    'UDD PMI Kabupaten Karawang',
    'UDD PMI Kabupaten Cirebon',
    'UDD PMI Kabupaten Garut'
  ],
  'Jawa Tengah': [
    'UDD PMI Kota Semarang',
    'UDD PMI Kota Surakarta (Solo)',
    'UDD PMI Kabupaten Banyumas (Purwokerto)',
    'UDD PMI Kota Tegal',
    'UDD PMI Kabupaten Kudus',
    'UDD PMI Kabupaten Cilacap'
  ],
  'Jawa Timur': [
    'UDD PMI Kota Surabaya',
    'UDD PMI Kota Malang',
    'UDD PMI Kota Sidoarjo',
    'UDD PMI Kota Kediri',
    'UDD PMI Kota Jember',
    'UDD PMI Kabupaten Gresik',
    'UDD PMI Kota Madiun'
  ],
  'Kalimantan Barat': [
    'UDD PMI Kota Pontianak'
  ],
  'Kalimantan Selatan': [
    'UDD PMI Kota Banjarmasin'
  ],
  'Kalimantan Tengah': [
    'UDD PMI Kota Palangkaraya'
  ],
  'Kalimantan Timur': [
    'UDD PMI Kota Samarinda',
    'UDD PMI Kota Balikpapan'
  ],
  'Kalimantan Utara': [
    'UDD PMI Kota Tarakan'
  ],
  'Kepulauan Bangka Belitung': [
    'UDD PMI Kota Pangkalpinang'
  ],
  'Kepulauan Riau': [
    'UDD PMI Kota Batam',
    'UDD PMI Kota Tanjungpinang'
  ],
  'Lampung': [
    'UDD PMI Kota Bandar Lampung'
  ],
  'Maluku': [
    'UDD PMI Kota Ambon'
  ],
  'Maluku Utara': [
    'UDD PMI Kota Ternate'
  ],
  'Nusa Tenggara Barat': [
    'UDD PMI Kota Mataram'
  ],
  'Nusa Tenggara Timur': [
    'UDD PMI Kota Kupang'
  ],
  'Papua': [
    'UDD PMI Kota Jayapura'
  ],
  'Papua Barat': [
    'UDD PMI Kota Manokwari'
  ],
  'Riau': [
    'UDD PMI Kota Pekanbaru',
    'UDD PMI Kota Dumai'
  ],
  'Sulawesi Barat': [
    'UDD PMI Kabupaten Mamuju'
  ],
  'Sulawesi Selatan': [
    'UDD PMI Kota Makassar',
    'UDD PMI Kota Parepare'
  ],
  'Sulawesi Tengah': [
    'UDD PMI Kota Palu'
  ],
  'Sulawesi Tenggara': [
    'UDD PMI Kota Kendari'
  ],
  'Sulawesi Utara': [
    'UDD PMI Kota Manado'
  ],
  'Sumatera Barat': [
    'UDD PMI Kota Padang',
    'UDD PMI Kota Bukittinggi'
  ],
  'Sumatera Selatan': [
    'UDD PMI Kota Palembang'
  ],
  'Sumatera Utara': [
    'UDD PMI Kota Medan',
    'UDD PMI Kota Pematangsiantar'
  ]
};

// Fallback general list of major PMI branches if province doesn't match
export const ALL_PMI_BRANCHES: string[] = Object.values(PMI_BRANCHES).flat().sort();
