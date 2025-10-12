# HTML Validation

This directory contains screenshots of HTML validation performed using the [W3C Markup Validation Service](https://validator.w3.org/).

## Validation Process

All HTML templates were validated in two ways:

1. Source code validation through direct input
2. URL validation of live pages (where applicable)

## Organization

The validation results are organized in two folders:

- `errors/`: Screenshots showing validation errors before fixes
- `passes/`: Screenshots showing successful validation after fixes

## Validation Results Summary

| Page | Status | Issues Found | Resolution | Screenshot |
|------|--------|--------------|------------|------------|
| Base Template | ❌ → ✅ | Missing crossorigin attribute on preconnect links, trailing slashes on void elements | Added crossorigin attribute, fixed void element syntax | [View](errors/base_template_errors.png) |
| Home Page | ❌ → ✅ | Trailing slashes on img elements, improper attribute values | Removed trailing slashes, corrected attribute values | [View](errors/Homepage_Html_validate_error.png) |
| Product Form | ❌ → ✅ | Incorrect use of placeholder attribute on date inputs, aria-describedby attributes without targets | Fixed attribute usage, connected aria attributes to proper targets | [View](errors/Product_form_html_errrors.png) |
| Add Routine | ❌ → ✅ | Value of 'for' attributes not matching ID of form controls, improper label associations | Connected labels to form controls with proper IDs | [View](errors/add_routine_html_errors.png) |
| Profile Page | ❌ → ✅ | aria-describedby attributes without corresponding elements, incorrect form structure | Added proper help text elements, fixed form structure | [View](errors/Html_error_profile_page.png) |
| Profile Edit | ❌ → ✅ | Style element in body, misplaced script elements | Moved style to head section, properly placed scripts before closing body tag | [View](errors/HTML_error_profile_edit_page.png) |
| My Routines | ❌ → ✅ | Possible misuse of aria-label attributes, empty action attributes on forms | Fixed ARIA attributes, added proper action URLs to forms | [View](errors/Dashboard_html_error.png) |

## Validation Passes

After implementing the fixes, all pages passed validation. Here are the screenshots of the successful validations:

| Page | Status | Screenshot |
|------|--------|------------|
| Base Template | ✅ | [View](passes/base_page_HTML_validation.png) |
| Home Page | ✅ | [View](passes/Homepage_html_validation_no_error.png) |
| Dashboard | ✅ | [View](passes/Dashboard_page_html_validation_no_error.png) |
| Product Page | ✅ | [View](passes/Product_page_html_validation_no_error.png) |
| Product Form | ✅ | [View](passes/Product_Form_page_html_validation_no_error.png) |
| Profile Page | ✅ | [View](passes/Profile_page_html_validation_no_error.png) |
| Profile Edit | ✅ | [View](passes/Profile_edit_page_HTML_validation.png) |
| Questionnaire | ✅ | [View](passes/Questionnaire_page_html_validation_no_error.png) |
| Login Page | ✅ | [View](passes/lognin_page_html_validation_no_error.png) |
| Signup Page | ✅ | [View](passes/signup_page_html_validation_no_error.png) |
| Edit Routine | ✅ | [View](passes/Edit_Routine_page_html_validation_no_error.png) |
| Delete Product | ✅ | [View](passes/Delete_product_page_html_validation_no_error.png) |
| Product Delete | ✅ | [View](passes/product_delete_page_html_validation_no_error.png) |

## Common Issues and Fixes

### 1. Missing crossorigin attribute and trailing slashes

Several `<link rel="preconnect">` elements were missing the required `crossorigin` attribute, and many void elements had unnecessary trailing slashes.

**Before:**

```html
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<img class="hero-bg" src="https://res.cloudinary.com/..." />
```

**After:**

```html
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<img class="hero-bg" src="https://res.cloudinary.com/...">
```

### 2. Incorrect placeholder attribute usage

The placeholder attribute was used on input types where it's not allowed (date inputs).

**Before:**

```html
<input type="date" name="expiry_date" class="form-control" placeholder="Select expiry date" aria-describedby="id_expiry_date_helptext" id="id_expiry_date">
```

**After:**

```html
<input type="date" name="expiry_date" class="form-control" aria-describedby="id_expiry_date_helptext" id="id_expiry_date">
<small id="id_expiry_date_helptext" class="form-text text-muted">Select expiry date</small>
```

### 3. aria-describedby without target elements

Many form elements had aria-describedby attributes referring to elements that didn't exist.

**Before:**

```html
<textarea name="additional_notes" cols="40" rows="3" class="form-control" placeholder="Tell us about care concerns or goals..." aria-describedby="id_additional_notes_helptext" id="id_additional_notes"></textarea>
```

**After:**

```html
<textarea name="additional_notes" cols="40" rows="3" class="form-control" placeholder="Tell us about care concerns or goals..." id="id_additional_notes"></textarea>
<span id="id_additional_notes_helptext" class="form-text text-muted">Optional additional notes about your skincare concerns</span>
```

### 4. Improper label 'for' attribute values

Many label elements had 'for' attributes that didn't match the ID of any form control.

**Before:**

```html
<label for="step1">Step 1</label>
<label for="product1">Product</label>
```

**After:**

```html
<label for="id_step1">Step 1</label>
<label for="id_product1">Product</label>
```

### 5. Empty form action attributes

Several forms had empty action attributes which is not allowed.

**Before:**

```html
<form method="post" action="" style="margin-top: 1rem;">
```

**After:**

```html
<form method="post" action="{% url 'submit_routine' %}" style="margin-top: 1rem;">
```

### 6. Possible misuse of aria-label

Several elements used aria-label in a potentially incorrect way.

**Before:**

```html
<div class="rating" aria-label="Rating: 4 out of 5">4/5</div>
```

**After:**

```html
<div class="rating"><span class="sr-only">Rating: 4 out of 5</span>4/5</div>
```

## Notes for Future Development

When adding new HTML templates:

1. Validate both during development and before deployment
2. Use proper Django template practices for form elements
3. Ensure proper nesting and closing of all HTML elements
4. Add appropriate ARIA attributes for accessibility
5. Be careful with void elements (img, input, link, etc.) - they don't need closing tags or trailing slashes in HTML5
6. When using aria-describedby, ensure the referenced element exists in the DOM
7. Use label 'for' attributes that match the exact ID of form controls
8. Avoid using placeholder attribute for non-allowed input types
9. Always provide non-empty action attributes for forms
