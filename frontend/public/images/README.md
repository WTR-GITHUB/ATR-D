# Statinių failų organizavimas

## Katalogų struktūra

```
frontend/public/images/
├── logos/           # Logotipai ir prekės ženklai
├── icons/           # Ikonos (SVG, PNG, ICO)
├── backgrounds/     # Fono paveikslėliai
└── avatars/         # Profilių nuotraukos
```

## Naudojimas Next.js'e

### Automatinis prieinamumas
Visi failai `public` kataloge automatiškai prieinami iš root URL:

```tsx
// Prieinama iš /images/icons/globe.svg
<img src="/images/icons/globe.svg" alt="Globe icon" />

// Prieinama iš /images/logos/logo.png
<img src="/images/logos/logo.png" alt="Logo" />
```

### Next.js Image komponentas
```tsx
import Image from 'next/image';

<Image 
  src="/images/backgrounds/login-bg.jpg" 
  alt="Login background"
  width={1920}
  height={1080}
/>
```

## Failų tipai ir rekomendacijos

### Ikonos (icons/)
- **SVG** - vektorinės ikonos, geriausia kokybė
- **PNG** - rastrinės ikonos su permatomumu
- **ICO** - Windows ikonos

### Logotipai (logos/)
- **PNG** - su permatomumu
- **SVG** - vektorinės versijos
- **JPG** - jei nereikia permatomumo

### Fono paveikslėliai (backgrounds/)
- **JPG** - nuotraukos
- **PNG** - su permatomumu
- **WebP** - modernus formatas, mažesnis dydis

### Profilių nuotraukos (avatars/)
- **PNG** - su permatomumu
- **JPG** - nuotraukos
- **WebP** - modernus formatas

## Optimizavimo patarimai

1. **SVG ikonoms** - naudoti SVG formatą, jis mažesnis ir geriausios kokybės
2. **Nuotraukoms** - naudoti WebP formatą su fallback į JPG/PNG
3. **Dydžiui** - optimizuoti failų dydžius (max 500KB ikonoms, 2MB nuotraukoms)
4. **Kiekiui** - naudoti lazy loading dideliems paveikslėliams
