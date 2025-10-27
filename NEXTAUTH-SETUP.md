# NextAuth Setup with Role-Based Access Control

## Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "next-auth": "^4.24.5",
    "@next-auth/prisma-adapter": "^1.0.7",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@types/next-auth": "^3.15.0"
  }
}
```

Install:
```bash
npm install next-auth @tanstack/react-query
npm install -D @types/next-auth
```

## Environment Variables

Add to your `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here
NEXT_PUBLIC_API_BASE=http://localhost:5000/api/v1
```

## Root Layout Integration

Update your `app/layout.tsx`:

```tsx
import { SessionProvider } from "@/components/providers/SessionProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

## Protected Route Usage

### Method 1: Server-side (Middleware)
Routes are automatically protected by middleware. Access control happens at:
- `/host-dashboard/*` - Host only
- `/client-dashboard/*` - Guest only
- `/admin/*` - Admin only

### Method 2: Client-side (Component Guards)

```tsx
import { RequireHost } from "@/components/auth/AuthGuard";

export default function HostDashboard() {
  return (
    <RequireHost>
      <div>Host-only content</div>
    </RequireHost>
  );
}
```

### Method 3: Hook-based

```tsx
import { useRequireHost } from "@/hooks/use-auth";

export default function HostPage() {
  const { user, isLoading } = useRequireHost();

  if (isLoading) return <div>Loading...</div>;

  return <div>Welcome, {user?.name}!</div>;
}
```

## API Calls with Authentication

### Client-side (with token injection)

```tsx
import { apiWithAuth } from "@/lib/api-with-auth";

// Usage in component
const { data } = useQuery({
  queryKey: ['guests'],
  queryFn: () => apiWithAuth<Guest[]>('/guests')
});
```

### Server-side (Server Components)

```tsx
import { apiServer } from "@/lib/api-with-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth-config";

export default async function GuestsList() {
  const session = await getServerSession(authOptions);
  const guests = await apiServer<Guest[]>('/guests', session?.accessToken);

  return (
    <div>
      {guests.map(guest => (
        <div key={guest.id}>{guest.name}</div>
      ))}
    </div>
  );
}
```

## Role Checking in Components

```tsx
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user, isHost, isGuest } = useAuth();

  return (
    <div>
      {isHost && <HostSpecificComponent />}
      {isGuest && <GuestSpecificComponent />}
    </div>
  );
}
```

## Sign In/Out

```tsx
import { signIn, signOut } from "next-auth/react";

// Sign in
await signIn("credentials", {
  email: "user@example.com",
  password: "password",
  userType: "host", // or "guest"
});

// Sign out
await signOut({ callbackUrl: "/" });
```

## Backend (.NET) Integration

### JWT Configuration in Program.cs:

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

builder.Services.AddAuthorization();
```

### Controller Authorization:

```csharp
[Authorize(Roles = "host")]
[ApiController]
public class HostController : ControllerBase
{
    private Guid GetHostId() => Guid.Parse(User.FindFirst("host_id")?.Value!);
}
```

## Session Types

The session includes:

```typescript
interface ExtendedSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: "host" | "guest" | "admin";
    hostId?: string;
    guestId?: string;
  };
  accessToken: string;
}
```

## Security Considerations

1. **JWT Secret**: Use a strong secret in production
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiry**: Tokens expire after 24 hours
4. **Refresh Logic**: Implement token refresh if needed
5. **CORS**: Configure CORS properly for your API

## Troubleshooting

1. **401 Errors**: Check if token is being sent correctly
2. **Redirect Loops**: Verify middleware matcher patterns
3. **Role Issues**: Ensure backend returns correct role claims
4. **Session Not Persisting**: Check NEXTAUTH_SECRET and cookies

## Testing

Test different user types:

```tsx
// In your test files
const mockSession = {
  user: { id: "1", email: "host@test.com", role: "host", hostId: "123" },
  accessToken: "mock-token"
};

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: mockSession, status: "authenticated" })
}));
```