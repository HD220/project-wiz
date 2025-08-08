# HTML/React Style Guide

## Structure Rules for React Components

### Component Organization
- Use functional components with hooks
- Props interfaces defined above component
- Use 2 spaces for indentation
- Place nested elements on new lines with proper indentation
- Content between tags should be on its own line when multi-line

### Component Props Pattern
```tsx
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: UserType) => void;
  className?: string;
  children?: React.ReactNode;
}

export function UserProfile({ 
  userId, 
  onUpdate, 
  className,
  children 
}: UserProfileProps) {
  // Component implementation
}
```

## Attribute Formatting

### React Props Formatting
- Place each prop on its own line when there are multiple props
- Align props vertically
- Keep the closing `>` on the same line as the last prop for short props, or on new line for complex props

### Simple Props Example
```tsx
<Button variant="primary"
        size="lg"
        onClick={handleClick}
        disabled={isLoading}>
  Submit
</Button>
```

### Complex Props Example
```tsx
<Card className="border border-gray-200 dark:border-gray-800 shadow-sm
                 hover:shadow-md dark:hover:shadow-lg
                 sm:rounded-lg
                 md:p-6
                 lg:p-8"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Clickable card">
  <CardContent>
    <h3 className="text-lg font-semibold
                   sm:text-xl
                   md:text-2xl">
      Card Title
    </h3>
  </CardContent>
</Card>
```

## React Component Structure Examples

### Page Component Structure
```tsx
// src/renderer/app/users/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { UserList } from '@/features/user';
import { loadApiData } from '@/utils/api';

export const Route = createFileRoute('/users/')({
  component: UsersPage,
  loader: () => loadApiData(() => window.api.user.list()),
});

function UsersPage() {
  const users = Route.useLoaderData();

  return (
    <div className="container mx-auto px-4 py-8
                    sm:px-6
                    md:px-8 md:py-12
                    lg:px-12 lg:py-16">
      <header className="mb-8
                         sm:mb-12
                         md:mb-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100
                       sm:text-3xl
                       md:text-4xl">
          Users
        </h1>
      </header>

      <main>
        <UserList users={users} />
      </main>
    </div>
  );
}
```

### Feature Component Structure
```tsx
// src/renderer/features/user/components/user-card.tsx
interface UserCardProps {
  user: UserType;
  onEdit?: (user: UserType) => void;
  onDelete?: (userId: string) => void;
  className?: string;
}

export function UserCard({ 
  user, 
  onEdit, 
  onDelete, 
  className 
}: UserCardProps) {
  const handleEdit = () => onEdit?.(user);
  const handleDelete = () => onDelete?.(user.id);

  return (
    <Card className={cn(
      "border border-gray-200 dark:border-gray-800 shadow-sm",
      "hover:shadow-md dark:hover:shadow-lg transition-shadow",
      "sm:rounded-lg",
      "md:p-6",
      "lg:p-8",
      className
    )}>
      <CardHeader className="pb-4
                             sm:pb-6">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100
                              sm:text-xl
                              md:text-2xl">
          {user.name}
        </CardTitle>
        
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400
                                    sm:text-base">
          {user.email}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4
                             sm:space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300
                           sm:text-base">
            Status:
          </span>
          <Badge variant={user.deactivatedAt ? "secondary" : "default"}
                 className="text-xs
                            sm:text-sm">
            {user.deactivatedAt ? "Inactive" : "Active"}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end space-x-2 pt-4
                             sm:space-x-4 sm:pt-6">
        {onEdit && (
          <Button variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800
                             sm:size-default">
            Edit
          </Button>
        )}
        
        {onDelete && (
          <Button variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="hover:bg-red-600
                             sm:size-default">
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

## Form Component Patterns

### Form Layout Structure
```tsx
<form onSubmit={handleSubmit}
      className="space-y-6
                 sm:space-y-8
                 md:space-y-10">
  <div className="grid grid-cols-1 gap-6
                  sm:grid-cols-2 sm:gap-8
                  md:gap-10">
    <FormField>
      <Label htmlFor="name"
             className="block text-sm font-medium text-gray-700 dark:text-gray-300
                        sm:text-base">
        Full Name
      </Label>
      
      <Input id="name"
             name="name"
             type="text"
             required
             value={formData.name}
             onChange={handleInputChange}
             className="mt-1 w-full
                        sm:mt-2" />
    </FormField>

    <FormField>
      <Label htmlFor="email"
             className="block text-sm font-medium text-gray-700 dark:text-gray-300
                        sm:text-base">
        Email Address
      </Label>
      
      <Input id="email"
             name="email"
             type="email"
             required
             value={formData.email}
             onChange={handleInputChange}
             className="mt-1 w-full
                        sm:mt-2" />
    </FormField>
  </div>

  <div className="flex justify-end space-x-4
                  sm:space-x-6">
    <Button type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}>
      Cancel
    </Button>
    
    <Button type="submit"
            disabled={isSubmitting}
            className="min-w-[100px]
                       sm:min-w-[120px]">
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        'Save User'
      )}
    </Button>
  </div>
</form>
```

## Layout Component Patterns

### Main Layout Structure
```tsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900
                     sticky top-0 z-50">
    <div className="container mx-auto px-4 py-4
                    sm:px-6
                    md:px-8 md:py-6
                    lg:px-12">
      <nav className="flex items-center justify-between">
        <Logo className="h-8 w-auto
                         sm:h-10
                         md:h-12" />
        
        <div className="flex items-center space-x-4
                        sm:space-x-6
                        md:space-x-8">
          <NavigationMenu />
          <UserMenu />
        </div>
      </nav>
    </div>
  </header>

  <main className="container mx-auto px-4 py-8
                   sm:px-6 sm:py-12
                   md:px-8 md:py-16
                   lg:px-12 lg:py-20">
    {children}
  </main>

  <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900
                     mt-auto">
    <div className="container mx-auto px-4 py-8
                    sm:px-6 sm:py-12
                    md:px-8">
      <FooterContent />
    </div>
  </footer>
</div>
```

## Accessibility Patterns

### Semantic HTML in React
```tsx
<article className="bg-white dark:bg-gray-900 rounded-lg shadow-sm
                    hover:shadow-md transition-shadow">
  <header className="p-6 border-b border-gray-200 dark:border-gray-700">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100"
        id="article-title">
      Article Title
    </h2>
    
    <time className="text-sm text-gray-600 dark:text-gray-400"
          dateTime={article.publishedAt}>
      {formatDate(article.publishedAt)}
    </time>
  </header>

  <section className="p-6"
           aria-labelledby="article-title">
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
      {article.content}
    </p>
  </section>

  <footer className="p-6 border-t border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <Button variant="outline"
              onClick={handleLike}
              aria-label={`Like article: ${article.title}`}
              aria-pressed={isLiked}>
        <Heart className={cn(
          "h-4 w-4 mr-2",
          isLiked && "fill-current text-red-500"
        )} />
        Like ({likesCount})
      </Button>
      
      <Button variant="ghost"
              onClick={handleShare}
              aria-label={`Share article: ${article.title}`}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    </div>
  </footer>
</article>
```

## Event Handling Patterns

### Form Event Handling
```tsx
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // Handle form submission
};

const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = event.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' && event.ctrlKey) {
    handleSubmit(event as any);
  }
};
```

## Important React/HTML Conventions

- Always use semantic HTML elements when possible
- Include proper ARIA attributes for accessibility
- Use meaningful `id` and `name` attributes for form elements
- Implement proper keyboard navigation support
- Include loading and error states for interactive elements
- Use TypeScript for all event handlers and props
- Follow consistent naming conventions for CSS classes and component props