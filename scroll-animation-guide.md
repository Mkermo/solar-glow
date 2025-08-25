# Implementing ScrollReveal Animations Across All Pages

We've successfully implemented scroll animations on several key pages (Index, Contact, and SolarEducation pages). This guide will help you implement similar animations across all remaining pages of the website.

## Basic Implementation Pattern

For each page, follow this pattern:

1. Import the `ScrollReveal` component:

   ```tsx
   import ScrollReveal from "@/components/ScrollReveal";
   ```

2. Wrap key sections with the `ScrollReveal` component:

   ```tsx
   <ScrollReveal>{/* Your section content */}</ScrollReveal>
   ```

3. Use direction and delay props for varied animations:
   ```tsx
   <ScrollReveal direction="up" delay={0.2}>
     {/* Content with upward animation and small delay */}
   </ScrollReveal>
   ```

## Recommended Animations Per Section Type

### Hero Sections

```tsx
<ScrollReveal initiallyVisible={true}>
  <div className="hero-content">
    <h1>Your Hero Title</h1>
    <p>Description text</p>
  </div>
</ScrollReveal>

<ScrollReveal direction="right" delay={0.2}>
  <div className="hero-image-container">
    <img src="/path/to/image.jpg" alt="Description" />
  </div>
</ScrollReveal>
```

### Card Grids

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <ScrollReveal direction="up" delay={0.1}>
    <Card>{/* Card 1 content */}</Card>
  </ScrollReveal>

  <ScrollReveal direction="up" delay={0.2}>
    <Card>{/* Card 2 content */}</Card>
  </ScrollReveal>

  <ScrollReveal direction="up" delay={0.3}>
    <Card>{/* Card 3 content */}</Card>
  </ScrollReveal>
</div>
```

### Text Sections

```tsx
<ScrollReveal>
  <div className="text-section">
    <h2>Section Title</h2>
    <p>Section content...</p>
  </div>
</ScrollReveal>
```

### Forms

```tsx
<ScrollReveal direction="up" delay={0.1}>
  <Card>
    <CardHeader>
      <CardTitle>Form Title</CardTitle>
    </CardHeader>
    <CardContent>
      <Form>{/* Form fields */}</Form>
    </CardContent>
  </Card>
</ScrollReveal>
```

### Accordion / FAQ Sections

```tsx
<ScrollReveal>
  <div className="accordion-section">
    <h2>Frequently Asked Questions</h2>
    <Accordion>{/* Accordion items */}</Accordion>
  </div>
</ScrollReveal>
```

## Priority Pages to Update

Here are the priority pages to update with ScrollReveal animations:

1. About.tsx - Company information page
2. ProductListing.tsx - Main products showcase
3. ProductDetail.tsx - Individual product pages
4. FAQs.tsx - Frequently asked questions
5. Cart.tsx & Checkout.tsx - Shopping cart and checkout flow

## Animation Direction Tips

- **For left-to-right languages (English)**:
  - Content typically animates from left → right
  - Images often animate from right → left
- **For right-to-left languages (Arabic)**:
  - Content typically animates from right → left
  - Images often animate from left → right

Adjust your animation directions based on the current language setting:

```tsx
<ScrollReveal direction={lang === "ar" ? "right" : "left"}>
  {/* Content that changes animation direction based on language */}
</ScrollReveal>
```

## Performance Tips

1. Use `once={true}` (default) for most animations to ensure they only trigger once per page load
2. For very long pages, use `<ScrollReveal>` only on key sections, not every small element
3. Stagger delays for groups of elements (0.1, 0.2, 0.3) for pleasing cascading effects
4. Use `initiallyVisible={true}` for above-the-fold content that should appear immediately

## Complete Example

Here's how to apply ScrollReveal to a product card grid:

```tsx
import ScrollReveal from "@/components/ScrollReveal";

// Inside your component:
return (
  <div className="container">
    <ScrollReveal>
      <h1>Our Products</h1>
      <p>Discover our range of solar solutions</p>
    </ScrollReveal>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {products.map((product, index) => (
        <ScrollReveal
          key={product.id}
          direction="up"
          delay={index * 0.1} // Staggered delay based on index
        >
          <ProductCard product={product} />
        </ScrollReveal>
      ))}
    </div>
  </div>
);
```

By following this guide, you'll have consistent scroll animations across your entire website, creating a modern and engaging user experience.
