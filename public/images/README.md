# Public Images

Letakkan semua gambar statis di folder ini.

Cara akses di Next.js:
- URL: /images/nama-file.ext (tanpa prefix public)
- React: 
  import Image from 'next/image'
  
  <Image src="/images/logo-example.svg" alt="Logo" width={64} height={64} />

Catatan:
- Format yang disarankan: .svg, .png, .jpg, .webp
- Untuk favicon: letakkan di public/favicon.ico
