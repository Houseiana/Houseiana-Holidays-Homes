# Angular to Next.js Migration Guide

This document provides detailed guidance on converting the remaining Angular components to Next.js/React.

## Quick Reference

### Component Conversion Patterns

#### Angular Component Template
```typescript
// Angular
@Component({
  selector: 'app-example',
  template: `
    <div class="container" *ngIf="data">
      <h1>{{ title }}</h1>
      <button (click)="handleClick()">Click Me</button>
      <div *ngFor="let item of items">{{ item.name }}</div>
    </div>
  `
})
export class ExampleComponent {
  title = 'Hello';
  data = true;
  items = [{ name: 'Item 1' }];

  handleClick() {
    console.log('clicked');
  }
}
```

#### React/Next.js Equivalent
```typescript
'use client';

import { useState } from 'react';

export function Example() {
  const [title] = useState('Hello');
  const [data] = useState(true);
  const items = [{ name: 'Item 1' }];

  const handleClick = () => {
    console.log('clicked');
  };

  return (
    <div className="container">
      {data && (
        <>
          <h1>{title}</h1>
          <button onClick={handleClick}>Click Me</button>
          {items.map((item, i) => (
            <div key={i}>{item.name}</div>
          ))}
        </>
      )}
    </div>
  );
}
```

## Common Conversions

### 1. Angular Directives → React Patterns

| Angular | React/Next.js |
|---------|---------------|
| `*ngIf="condition"` | `{condition && <div>...</div>}` |
| `*ngFor="let item of items"` | `{items.map(item => <div key={item.id}>...</div>)}` |
| `[class.active]="isActive"` | `className={isActive ? 'active' : ''}` |
| `[style.color]="color"` | `style={{ color }}` |
| `(click)="handler()"` | `onClick={handler}` |
| `[(ngModel)]="value"` | `value={value} onChange={e => setValue(e.target.value)}` |

### 2. Router Navigation

```typescript
// Angular
constructor(private router: Router) {}

navigateTo() {
  this.router.navigate(['/path']);
}
```

```typescript
// Next.js
'use client';
import { useRouter } from 'next/navigation';

export function Component() {
  const router = useRouter();

  const navigateTo = () => {
    router.push('/path');
  };
}
```

### 3. Route Parameters

```typescript
// Angular
constructor(private route: ActivatedRoute) {}

ngOnInit() {
  this.route.params.subscribe(params => {
    const id = params['id'];
  });
}
```

```typescript
// Next.js - app/property/[id]/page.tsx
export default function PropertyPage({
  params
}: {
  params: { id: string }
}) {
  const id = params.id;
  // use id...
}
```

### 4. Services → Hooks

```typescript
// Angular Service
@Injectable({ providedIn: 'root' })
export class DataService {
  private data$ = new BehaviorSubject<Data[]>([]);

  getData(): Observable<Data[]> {
    return this.http.get<Data[]>('/api/data');
  }
}
```

```typescript
// Next.js Hook
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export function useData() {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    setLoading(true);
    const response = await apiClient.get<Data[]>('/data');
    if (response.data) setData(response.data);
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  return { data, loading, refetch: getData };
}
```

### 5. Forms

```typescript
// Angular Reactive Forms
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
    }
  }
}
```

```typescript
// Next.js with controlled inputs
'use client';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // submit logic
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

## Step-by-Step Component Migration

### Example: Converting Property Card Component

#### Step 1: Read Angular Component
Location: `Houseiana- Frontend/src/app/components/property-card/`

#### Step 2: Identify Dependencies
- Props/Inputs: `@Input() property: Property`
- Events/Outputs: `@Output() onSelect = new EventEmitter()`
- Services: PropertyService, WishlistService

#### Step 3: Create React Component

```typescript
// components/property/property-card.tsx
'use client';

import { Property } from '@/types/property';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
}

export function PropertyCard({ property, onSelect }: PropertyCardProps) {
  const handleClick = () => {
    onSelect?.(property);
  };

  return (
    <Link href={`/property/${property.id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
        <div className="relative h-48">
          <Image
            src={property.photos[0]?.url || '/placeholder.jpg'}
            alt={property.title}
            fill
            className="object-cover"
          />
          <button className="absolute top-2 right-2 p-2 bg-white rounded-full">
            <Heart className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg">{property.title}</h3>
          <p className="text-gray-600">{property.address.city}</p>
          <p className="font-bold mt-2">
            ${property.pricing.basePrice}/night
          </p>
        </div>
      </div>
    </Link>
  );
}
```

## File Structure Mapping

```
Angular                              →  Next.js
────────────────────────────────────────────────────────────────
src/app/pages/home/                  →  app/page.tsx
src/app/pages/discover/              →  app/discover/page.tsx
src/app/pages/property-detail/       →  app/property/[id]/page.tsx
src/app/pages/client-dashboard/      →  app/client-dashboard/page.tsx
src/app/pages/login/                 →  app/login/page.tsx

src/app/components/                  →  components/
src/app/services/                    →  lib/hooks/
src/app/models/                      →  types/
src/app/core/guards/                 →  middleware.ts
src/styles.css                       →  app/globals.css
```

## Common Patterns in Houseiana

### 1. Dashboard Layout
```typescript
// app/client-dashboard/layout.tsx
'use client';

import { Header } from '@/components/layout/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex mt-16">
        <DashboardSidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 2. Data Fetching Page
```typescript
// app/discover/page.tsx
'use client';

import { useProperties } from '@/lib/hooks/use-properties';
import { PropertyCard } from '@/components/property/property-card';
import { Header } from '@/components/layout/header';

export default function DiscoverPage() {
  const { properties, loading } = useProperties();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-8">Discover Properties</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </main>
    </div>
  );
}
```

### 3. Form with Validation
```typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      router.push('/client-dashboard');
    } catch (err) {
      console.error('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>
        )}

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
          required
        />

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 border rounded"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

## Testing Your Conversion

1. **Component renders correctly**: Check UI matches Angular version
2. **State updates work**: Test form inputs, buttons, toggles
3. **Navigation works**: Links and programmatic navigation
4. **API calls succeed**: Check network tab for correct requests
5. **Auth flows**: Login, logout, protected routes
6. **Error handling**: Test error states and loading states

## Common Pitfalls

1. **'use client' directive**: Remember to add this at the top of files using hooks or browser APIs
2. **Image optimization**: Use Next.js `<Image>` component instead of `<img>`
3. **Key props**: Always add `key` in map functions
4. **Event handlers**: Use camelCase (onClick not onclick)
5. **Async operations**: Handle promises properly, don't forget error handling
6. **State initialization**: Use useState for component state
7. **Side effects**: Use useEffect for operations after render

## Next Steps

Priority components to convert:
1. Login/Register pages
2. Discover page with filters
3. Property detail page
4. Client dashboard
5. Host dashboard
6. Booking flow

Good luck with the migration! Refer to the existing converted components as templates.
