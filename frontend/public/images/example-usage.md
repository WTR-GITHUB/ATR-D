# Statinių failų naudojimo pavyzdžiai

## Ikonų naudojimas

### SVG ikonos (rekomenduojama)
```tsx
// Paprastas img elementas
<img src="/images/icons/globe.svg" alt="Globe icon" className="w-6 h-6" />

// Su Tailwind CSS
<img src="/images/icons/file.svg" alt="File icon" className="w-5 h-5 text-gray-600" />
```

### Next.js Image komponentas (optimizuotas)
```tsx
import Image from 'next/image';

<Image 
  src="/images/icons/next.svg" 
  alt="Next.js logo"
  width={32}
  height={32}
  className="inline-block"
/>
```

## Logotipų naudojimas

```tsx
// Logotipas su responsive dydžiu
<img 
  src="/images/logos/a-dienynas-logo.png" 
  alt="A-DIENYNAS Logo"
  className="h-8 md:h-12 lg:h-16"
/>
```

## Fono paveikslėlių naudojimas

```tsx
// Fono paveikslėlis su CSS
<div 
  className="bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: 'url(/images/backgrounds/login-bg.jpg)' }}
>
  {/* Turinys */}
</div>

// Arba su Next.js Image
<Image 
  src="/images/backgrounds/login-bg.jpg"
  alt="Login background"
  fill
  className="object-cover"
  priority
/>
```

## Profilių nuotraukų naudojimas

```tsx
// Profilio nuotrauka su fallback
<img 
  src="/images/avatars/user-avatar.png" 
  alt="User avatar"
  onError={(e) => {
    e.target.src = '/images/avatars/default-avatar.png';
  }}
  className="w-10 h-10 rounded-full"
/>
```

## Komponentų pavyzdžiai

### IconButton komponentas
```tsx
interface IconButtonProps {
  icon: string;
  alt: string;
  onClick: () => void;
  className?: string;
}

export function IconButton({ icon, alt, onClick, className = "" }: IconButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 rounded-lg hover:bg-gray-100 ${className}`}
    >
      <img 
        src={`/images/icons/${icon}`} 
        alt={alt}
        className="w-5 h-5"
      />
    </button>
  );
}

// Naudojimas
<IconButton 
  icon="file.svg" 
  alt="File action"
  onClick={() => console.log('File clicked')}
/>
```

### Logo komponentas
```tsx
export function Logo({ className = "" }: { className?: string }) {
  return (
    <img 
      src="/images/logos/a-dienynas-logo.png"
      alt="A-DIENYNAS"
      className={`h-8 ${className}`}
    />
  );
}
```

## Optimizavimo patarimai

1. **SVG ikonoms** - naudoti tiesiogiai, jos automatiškai optimizuojamos
2. **Dideliems paveikslėliams** - naudoti Next.js Image komponentą su lazy loading
3. **Fono paveikslėliams** - naudoti CSS background-image su media queries
4. **Responsive dizainui** - naudoti skirtingus dydžius su srcset arba CSS classes
